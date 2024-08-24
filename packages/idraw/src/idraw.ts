import { Core, coreEventKeys } from '@idraw/core';
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
import { defaultSettings, getDefaultStorage, defaultMode, parseStyles, parseSettings } from './setting/config';
import { exportImageFileBlobURL } from './file';
import type { ExportImageFileBaseOptions, ExportImageFileResult } from './file';
import type { IDrawEvent } from './event';
import { changeMode, runMiddlewares } from './setting/mode';
import { changeStyles } from './setting/style';

export class iDraw {
  #core: Core<IDrawEvent>;
  #opts: IDrawOptions;
  #store: Store<IDrawStorage> = new Store<IDrawStorage>({
    defaultStorage: getDefaultStorage()
  });

  constructor(mount: HTMLDivElement, options: IDrawOptions) {
    const opts = { ...defaultSettings, ...options };
    this.#store.set('middlewareStyles', parseStyles(opts));
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
  }

  #setFeature(feat: IDrawFeature, status: boolean) {
    const store = this.#store;
    if (['ruler', 'scroll', 'scale', 'info'].includes(feat)) {
      const map: Record<IDrawFeature | string, keyof Omit<IDrawStorage, 'mode'>> = {
        ruler: 'enableRuler',
        scroll: 'enableScroll',
        scale: 'enableScale',
        info: 'enableInfo'
      };
      store.set(map[feat], !!status);
      runMiddlewares(this.#core, store);
      this.#core.refresh();
    } else if (feat === 'selectInGroup') {
      this.#core.trigger(coreEventKeys.SELECT_IN_GROUP, {
        enable: !!status
      });
    } else if (feat === 'snapToGrid') {
      this.#core.trigger(coreEventKeys.SNAP_TO_GRID, {
        enable: !!status
      });
    }
  }

  reset(opts: IDrawSettings) {
    const core = this.#core;
    const store = this.#store;
    const { mode, styles } = parseSettings(opts);
    let needFresh = false;
    let newOpts: IDrawSettings = {};
    store.clear();
    if (mode) {
      changeMode(mode, core, store);
      newOpts.mode = mode;
      needFresh = true;
    }
    if (styles) {
      changeStyles(styles, core, store);
      newOpts.styles = styles;
      needFresh = true;
    }

    if (needFresh === true) {
      core.refresh();
    }

    this.#opts = {
      ...this.#opts,
      ...newOpts
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
    core.trigger(coreEventKeys.CHANGE, { data, type: 'setData' });
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
    if (data?.layout || (Array.isArray(data?.elements) && data?.elements.length > 0)) {
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
    this.#core.trigger(name, e as IDrawEvent[T]);
  }

  selectElement(uuid: string) {
    this.selectElements([uuid]);
  }

  selectElements(uuids: string[]) {
    this.trigger(coreEventKeys.SELECT, { uuids });
  }

  selectElementByPosition(position: ElementPosition) {
    this.selectElementsByPositions([position]);
  }

  selectElementsByPositions(positions: ElementPosition[]) {
    this.trigger(coreEventKeys.SELECT, { positions });
  }

  cancelElements() {
    this.trigger(coreEventKeys.CLEAR_SELECT, { uuids: [] });
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
    core.trigger(coreEventKeys.CHANGE, { data, type: 'updateElement' });
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
    core.trigger(coreEventKeys.CHANGE, { data, type: 'addElement' });
    return data;
  }

  deleteElement(uuid: string) {
    const core = this.#core;
    const data: Data = core.getData() || { elements: [] };
    deleteElementInList(uuid, data.elements);
    core.setData(data);
    core.refresh();
    core.trigger(coreEventKeys.CHANGE, { data, type: 'deleteElement' });
  }

  moveElement(uuid: string, to: ElementPosition) {
    const core = this.#core;
    const data: Data = core.getData() || { elements: [] };
    const from = getElementPositionFromList(uuid, data.elements);
    const { elements: list } = moveElementPosition(data.elements, { from, to });
    data.elements = list;
    core.setData(data);
    core.refresh();
    core.trigger(coreEventKeys.CHANGE, { data, type: 'moveElement' });
  }

  async getImageBlobURL(opts?: ExportImageFileBaseOptions): Promise<ExportImageFileResult> {
    const data = this.getData() || { elements: [] };
    const { devicePixelRatio } = opts || { devicePixelRatio: 1 };

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

  getViewCenter(): PointSize {
    const { viewScaleInfo, viewSizeInfo } = this.getViewInfo();
    const pointSize: PointSize = calcViewCenter({ viewScaleInfo, viewSizeInfo });
    return pointSize;
  }

  $onBoardWatcherEvents() {
    this.#core.onBoardWatcherEvents();
  }

  $offBoardWatcherEvents() {
    this.#core.offBoardWatcherEvents();
  }
}
