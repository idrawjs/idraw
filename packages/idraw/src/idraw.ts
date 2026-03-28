import { Core, coreEventKeys } from '@idraw/core';
import type {
  Point,
  IDrawOptions,
  IDrawSettings,
  IDrawFeature,
  IDrawMode,
  IDrawModeEventMap,
  Data,
  ViewSizeInfo,
  ViewScaleInfo,
  MaterialType,
  StrictMaterial,
  RecursivePartial,
  MaterialPosition,
  IDrawStorage,
  DataLayout,
  DataGlobal,
  Middleware,
  HistoryHandler,
} from '@idraw/types';
import { filterCompactData, calcViewCenterContent, calcViewCenter, Store } from '@idraw/util';
import { defaultSettings, defaultOptions, getDefaultStorage, defaultMode, parseStyles } from './setting/config';
import type { ExportImageFileBaseOptions, ExportImageFileResult } from './file';
import type { IDrawEvent } from './event';
import { changeMode } from './setting/mode';
import {
  createMaterial,
  updateMaterial,
  modifyMaterial,
  addMaterial,
  deleteMaterial,
  moveMaterial,
} from './methods/material';
import { modifyLayout } from './methods/layout';
import { modifyGlobal } from './methods/global';
import { reset } from './methods/reset';
import { setFeature } from './methods/feature';
import { getImageBlobURL } from './methods/image';
import { useHistory } from './middlewares/use-history';

export class iDraw {
  #core: Core<IDrawEvent>;
  #opts: IDrawOptions;
  #store: Store<IDrawStorage> = new Store<IDrawStorage>({
    defaultStorage: getDefaultStorage(),
  });
  #historyHandler: HistoryHandler | null = null;

  constructor(mount: HTMLDivElement, options: IDrawOptions) {
    const opts = { ...defaultSettings, ...defaultOptions, ...options };
    this.#store.set('middlewareStyles', parseStyles(opts));
    const { width, height, devicePixelRatio, disableWatcher } = opts;
    const core = new Core<IDrawEvent>(mount, { width, height, devicePixelRatio, disableWatcher });
    this.#core = core;
    this.#opts = opts;
    this.#init();
  }

  #init() {
    const core = this.#core;
    const store = this.#store;

    if (this.#opts.history === true) {
      const { historyLimit } = this.#opts;
      const { historyHandler, MiddlewareHistory } = useHistory({ core, limit: historyLimit });
      this.#historyHandler = historyHandler;
      core.use(MiddlewareHistory);
    }
    changeMode('select', undefined, core, store);
  }

  #setFeature(feat: IDrawFeature, status: boolean) {
    return setFeature({ core: this.#core, store: this.#store }, feat, status);
  }

  use<C extends any = any>(middleware: Middleware<any, any, any>, config?: C) {
    this.#core.use<C>(middleware, config);
  }

  disuse(middleware: Middleware<any, any, any>) {
    this.#core.disuse(middleware);
  }

  reset(opts: IDrawSettings) {
    const newOpts = reset({ core: this.#core, store: this.#store }, opts);
    this.#opts = { ...this.#opts, ...newOpts };
  }

  setMode<T extends IDrawMode>(mode: IDrawMode, e?: IDrawModeEventMap[T]) {
    const core = this.#core;
    const store = this.#store;
    changeMode<T>(mode || defaultMode, e, core, store);
    core.refresh();
  }

  getMode(): IDrawMode | undefined | null {
    return this.#store.get('mode');
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
        loadItemMap: this.#core.getLoadItemMap(),
      });
    }
    return data;
  }

  getViewInfo(): { viewSizeInfo: ViewSizeInfo; viewScaleInfo: ViewScaleInfo } {
    return this.#core.getViewInfo();
  }

  scale(opts: { scale: number; point: Point }) {
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
    if (data?.layout || (Array.isArray(data?.materials) && data?.materials.length > 0)) {
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

  selectMaterial(id: string, opts?: { type?: string }) {
    this.trigger(coreEventKeys.SELECT, { ids: [id], type: opts?.type || 'selectMaterial' });
  }

  selectMaterials(ids: string[], opts?: { type?: string }) {
    this.trigger(coreEventKeys.SELECT, { ids, type: opts?.type || 'selectMaterials' });
  }

  selectMaterialByPosition(position: MaterialPosition, opts?: { type?: string }) {
    this.trigger(coreEventKeys.SELECT, { positions: [position], type: opts?.type || 'selectMaterialByPosition' });
  }

  selectMaterialsByPositions(positions: MaterialPosition[], opts?: { type?: string }) {
    this.trigger(coreEventKeys.SELECT, { positions, type: opts?.type || 'selectMaterialsByPositions' });
  }

  cancelMaterials() {
    this.trigger(coreEventKeys.CLEAR_SELECT, { ids: [] });
  }

  createMaterial<T extends MaterialType>(
    type: T,
    material: RecursivePartial<Omit<StrictMaterial<T>, 'id' | 'type'>>,
    opts?: { viewCenter?: boolean }
  ): StrictMaterial<T> {
    return createMaterial<T>({ core: this.#core }, type, material as StrictMaterial, opts);
  }

  updateMaterial(material: StrictMaterial) {
    return updateMaterial({ core: this.#core }, material);
  }

  modifyMaterial(material: RecursivePartial<Omit<StrictMaterial, 'id'>> & Pick<StrictMaterial, 'id'>) {
    return modifyMaterial({ core: this.#core }, material);
  }

  addMaterial(material: StrictMaterial, opts?: { position: MaterialPosition }): Data {
    return addMaterial({ core: this.#core }, material, opts);
  }

  deleteMaterial(id: string) {
    return deleteMaterial({ core: this.#core }, id);
  }

  moveMaterial(id: string, to: MaterialPosition) {
    return moveMaterial({ core: this.#core }, id, to);
  }

  modifyLayout(layout: RecursivePartial<DataLayout> | null) {
    return modifyLayout({ core: this.#core }, layout);
  }

  modifyGlobal(global: RecursivePartial<DataGlobal> | null) {
    return modifyGlobal({ core: this.#core }, global);
  }

  async getImageBlobURL(opts?: ExportImageFileBaseOptions): Promise<ExportImageFileResult> {
    const data = this.getData() || { materials: [] };
    const { viewSizeInfo } = this.getViewInfo();
    return await getImageBlobURL({ data, viewSizeInfo, core: this.#core }, opts);
  }

  isDestroyed() {
    return this.#core.isDestroyed();
  }

  destroy() {
    this.#core.destroy();
    this.#store.destroy();
    this.#historyHandler?.destroy();
    this.#core = null as any;
    this.#store = null as any;
    this.#historyHandler = null as any;
  }

  getViewCenter(): Point {
    const { viewScaleInfo, viewSizeInfo } = this.getViewInfo();
    const pointSize: Point = calcViewCenter({ viewScaleInfo, viewSizeInfo });
    return pointSize;
  }

  getCore() {
    return this.#core;
  }

  forceRender() {
    return this.#core.forceRender();
  }

  getHistoryHandler() {
    return this.#historyHandler;
  }

  redo() {
    this.#historyHandler?.redo();
  }

  undo() {
    this.#historyHandler?.undo();
  }

  clearHistory() {
    this.#historyHandler?.clear();
  }
}
