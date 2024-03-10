import { Core } from '@idraw/core';
import type {
  PointSize,
  IDrawOptions,
  IDrawSettings,
  IDrawFeature,
  IDrawMode,
  Data,
  ViewSizeInfo,
  ViewScaleInfo,
  ElementType,
  Element,
  RecursivePartial,
  ElementPosition,
  IDrawStorage
} from '@idraw/types';
import type { IDrawEvent } from './event';
import {
  createElement,
  insertElementToListByPosition,
  updateElementInList,
  deleteElementInList,
  moveElementPosition,
  getElementPositionFromList,
  calcElementListSize,
  filterCompactData,
  calcViewCenterContent,
  calcViewCenter,
  Store
} from '@idraw/util';
import { defaultSettings, getDefaultStorage, defaultMode } from './config';
import { exportImageFileBlobURL } from './file';
import type { ExportImageFileBaseOptions, ExportImageFileResult } from './file';
import { eventKeys } from './event';
import { changeMode } from './mode';

export class iDraw {
  #core: Core<IDrawEvent>;
  #opts: IDrawOptions;
  #store: Store<IDrawStorage> = new Store<IDrawStorage>({
    defaultStorage: getDefaultStorage()
  });

  constructor(mount: HTMLDivElement, options: IDrawOptions) {
    const opts = { ...defaultSettings, ...options };
    const { width, height, devicePixelRatio, createCustomContext2D } = opts;
    const core = new Core<IDrawEvent>(mount, { width, height, devicePixelRatio, createCustomContext2D });
    this.#core = core;
    this.#opts = opts;
    this.#init();
  }

  #init() {
    const core = this.#core;
    const store = this.#store;
    changeMode('select', core, store);
    this.enable('ruler');
  }

  #setFeature(feat: IDrawFeature, status: boolean) {
    if (feat === 'ruler') {
      const store = this.#store;
      store.set('enableRuler', !!status);
      const currentMode = store.get('mode');
      this.setMode(currentMode);
    }
  }

  reset(opts: IDrawSettings) {
    const core = this.#core;
    const store = this.#store;
    store.clear();
    changeMode(opts.mode || defaultMode, core, store);
    core.refresh();
    this.#opts = {
      ...this.#opts,
      ...opts
    };
  }

  setMode(mode: IDrawMode) {
    const core = this.#core;
    const store = this.#store;
    changeMode(mode || defaultMode, core, store);
    core.refresh();
  }

  enable(feat: IDrawFeature) {
    this.#setFeature(feat, true);
  }

  disable(feat: IDrawFeature) {
    this.#setFeature(feat, false);
  }

  setData(data: Data) {
    const core = this.#core;
    core.setData(data);
    core.trigger(eventKeys.change, { data, type: 'setData' });
  }

  getData(opts?: { compact?: boolean }): Data | null {
    const data = this.#core.getData();
    if (data && opts?.compact === true) {
      return filterCompactData(data, {
        loadItemMap: this.#core.getLoadItemMap()
      });
    }
    return data;
  }

  getViewInfo(): {
    viewSizeInfo: ViewSizeInfo;
    viewScaleInfo: ViewScaleInfo;
  } {
    return this.#core.getViewInfo();
  }

  scale(opts: { scale: number; point: PointSize }) {
    this.#core.scale(opts);
  }

  setViewScale(opts: { scale: number; offsetX: number; offsetY: number }) {
    const core = this.#core;
    core.setViewScale(opts);
    core.refresh();
  }

  centerContent(opts?: { data?: Data }) {
    const data = opts?.data || this.#core.getData();
    const { viewSizeInfo } = this.getViewInfo();
    if (Array.isArray(data?.elements) && data?.elements.length > 0) {
      const result = calcViewCenterContent(data, { viewSizeInfo });
      this.setViewScale(result);
    }
  }

  resize(opts: Partial<ViewSizeInfo>) {
    this.#core.resize(opts);
  }

  on<T extends keyof IDrawEvent>(name: T, callback: (e: IDrawEvent[T]) => void) {
    this.#core.on(name, callback);
  }

  off<T extends keyof IDrawEvent>(name: T, callback: (e: IDrawEvent[T]) => void) {
    this.#core.off(name, callback);
  }

  trigger<T extends keyof IDrawEvent>(name: T, e?: IDrawEvent[T]) {
    this.#core.trigger(name, e);
  }

  selectElement(uuid: string) {
    this.selectElements([uuid]);
  }

  selectElements(uuids: string[]) {
    this.trigger(eventKeys.select, { uuids });
  }

  selectElementByPosition(position: ElementPosition) {
    this.selectElementsByPositions([position]);
  }

  selectElementsByPositions(positions: ElementPosition[]) {
    this.trigger(eventKeys.select, { positions });
  }

  cancelElements() {
    this.trigger(eventKeys.select, { uuids: [] });
  }

  createElement<T extends ElementType>(
    type: T,
    opts?: {
      element?: RecursivePartial<Element<T>>;
      viewCenter?: boolean;
    }
  ): Element<T> {
    const { viewScaleInfo, viewSizeInfo } = this.#core.getViewInfo();
    return createElement<T>(
      type,
      opts?.element || {},
      opts?.viewCenter === true
        ? {
            viewScaleInfo,
            viewSizeInfo
          }
        : undefined
    );
  }

  updateElement(element: Element) {
    const core = this.#core;
    const data: Data = core.getData() || { elements: [] };
    updateElementInList(element.uuid, element, data.elements);
    core.setData(data);
    core.refresh();
    core.trigger(eventKeys.change, { data, type: 'updateElement' });
  }

  addElement(
    element: Element,
    opts?: {
      position: ElementPosition;
    }
  ): Data {
    const core = this.#core;
    const data: Data = core.getData() || { elements: [] };
    if (!opts || !opts?.position?.length) {
      data.elements.push(element);
    } else if (opts?.position) {
      const position = [...opts?.position];
      insertElementToListByPosition(element, position, data.elements);
    }
    core.setData(data);
    core.refresh();
    core.trigger(eventKeys.change, { data, type: 'addElement' });
    return data;
  }

  deleteElement(uuid: string) {
    const core = this.#core;
    const data: Data = core.getData() || { elements: [] };
    deleteElementInList(uuid, data.elements);
    core.setData(data);
    core.refresh();
    core.trigger(eventKeys.change, { data, type: 'deleteElement' });
  }

  moveElement(uuid: string, to: ElementPosition) {
    const core = this.#core;
    const data: Data = core.getData() || { elements: [] };
    const from = getElementPositionFromList(uuid, data.elements);
    const { elements: list } = moveElementPosition(data.elements, { from, to });
    data.elements = list;
    core.setData(data);
    core.refresh();
    core.trigger(eventKeys.change, { data, type: 'moveElement' });
  }

  async getImageBlobURL(opts: ExportImageFileBaseOptions): Promise<ExportImageFileResult> {
    const data = this.getData() || { elements: [] };
    const { devicePixelRatio } = opts;

    const outputSize = calcElementListSize(data.elements);
    const { viewSizeInfo } = this.getViewInfo();
    return await exportImageFileBlobURL({
      width: outputSize.w,
      height: outputSize.h,
      devicePixelRatio,
      data,
      viewScaleInfo: { scale: 1, offsetLeft: -outputSize.x, offsetTop: -outputSize.y, offsetBottom: 0, offsetRight: 0 },
      viewSizeInfo: {
        ...viewSizeInfo,
        ...{ devicePixelRatio }
      },
      loadItemMap: this.#core.getLoadItemMap()
    });
  }

  isDestroyed() {
    return this.#core.isDestroyed();
  }

  destroy() {
    const core = this.#core;
    const store = this.#store;
    core.destroy();
    store.destroy();
  }

  getViewCenter() {
    const { viewScaleInfo, viewSizeInfo } = this.getViewInfo();
    return calcViewCenter({ viewScaleInfo, viewSizeInfo });
  }

  $onBoardWatcherEvents() {
    this.#core.onBoardWatcherEvents();
  }

  $offBoardWatcherEvents() {
    this.#core.offBoardWatcherEvents();
  }
}
