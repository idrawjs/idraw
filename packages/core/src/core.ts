import type {
  Data,
  Point,
  CoreOptions,
  Middleware,
  ViewSizeInfo,
  CoreEventMap,
  ViewScaleInfo,
  LoadItemMap,
  MaterialType,
  RecursivePartial,
  Material,
  StrictMaterial,
  ModifyRecord,
  MaterialPosition,
  DataLayout,
  FlattenLayout,
  DataGlobal,
} from '@idraw/types';
import {
  deepClone,
  createMaterial,
  getMaterialPositionFromList,
  toFlattenMaterial,
  deleteMaterialInList,
  findMaterialFromListByPosition,
  updateMaterialInListByPosition,
  insertMaterialToListByPosition,
  moveMaterialPosition,
  toFlattenLayout,
  toFlattenGlobal,
  get,
  mergeLayout,
  mergeGlobal,
  setHTMLCSSProps,
  createBoardContent,
  validateMaterials,
} from '@idraw/util';
import { Board } from './board';
import { Cursor } from './cursor/cursor';
import { getModifyMaterialRecord } from './record';

export class Core<E extends CoreEventMap = CoreEventMap> {
  #board: Board<E>;
  // #opts: CoreOptions;
  #canvas: HTMLCanvasElement;
  #container: HTMLDivElement;

  constructor(container: HTMLDivElement, opts: CoreOptions) {
    const { devicePixelRatio = 1, width, height, disableWatcher = false } = opts;

    setHTMLCSSProps(container, { width, height });
    // this.#opts = opts;
    this.#container = container;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('tabindex', '0');
    setHTMLCSSProps(canvas, { margin: 0, padding: 0 });
    this.#canvas = canvas;
    this.#initContainer();
    container.appendChild(canvas);

    const boardContent = createBoardContent(canvas, { width, height, devicePixelRatio });
    const board = new Board<E>({ boardContent, container, disableWatcher });
    const sharer = board.getSharer();
    sharer.setActiveViewSizeInfo({
      width,
      height,
      devicePixelRatio,
      contextWidth: width,
      contextHeight: height,
    });
    this.#board = board;
    this.resize(sharer.getActiveViewSizeInfo());
    const eventHub = board.getEventHub();
    new Cursor(container, {
      eventHub,
    });
  }

  isDestroyed() {
    return this.#board.isDestroyed();
  }

  destroy() {
    this.#board.destroy();
    this.#canvas.remove();
  }

  #initContainer() {
    setHTMLCSSProps(this.#container, {
      position: 'relative',
      margin: '0px',
      padding: '0px',
      overflow: 'hidden',
    });
  }

  use<C extends any = any>(middleware: Middleware<any, any, any>, config?: C) {
    this.#board.use<C>(middleware, config);
  }

  disuse(middleware: Middleware<any, any, any>) {
    this.#board.disuse(middleware);
  }

  resetMiddlewareConfig<C extends any = any>(middleware: Middleware<any, any, any>, config?: Partial<C>) {
    this.#board.resetMiddlewareConfig(middleware, config);
  }

  #resetData(data: Data) {
    validateMaterials(data?.materials || []);
    this.#board.setData(data);
  }

  setData(data: Data) {
    const loader = this.#board.getRenderer().getLoader();
    loader.reset();
    this.#resetData(data);
  }

  getData(): Data | null {
    return this.#board.getData();
  }

  scale(opts: { scale: number; point: Point }) {
    this.#board.scale(opts);
    const viewer = this.#board.getViewer();
    viewer.drawFrame();
  }

  resize(newViewSize: Partial<ViewSizeInfo>) {
    const board = this.#board;
    const container = this.#container;
    const sharer = board.getSharer();
    const viewSizeInfo = sharer.getActiveViewSizeInfo();
    const viewSize = {
      ...viewSizeInfo,
      ...newViewSize,
    };
    const { width, height } = viewSize;
    setHTMLCSSProps(container, { width, height });
    board.resize(viewSize);
  }

  clear() {
    this.#board.clear();
  }

  on<T extends keyof E>(name: T, callback: (e: E[T]) => void) {
    const eventHub = this.#board.getEventHub();
    eventHub.on(name, callback);
  }

  off<T extends keyof E>(name: T, callback: (e: E[T]) => void) {
    const eventHub = this.#board.getEventHub();
    eventHub.off(name, callback);
  }

  trigger<T extends keyof E>(name: T, e: E[T]) {
    const eventHub = this.#board.getEventHub();
    eventHub.trigger(name, e);
  }

  getViewInfo(): { viewSizeInfo: ViewSizeInfo; viewScaleInfo: ViewScaleInfo } {
    const board = this.#board;
    const sharer = board.getSharer();
    const viewSizeInfo = sharer.getActiveViewSizeInfo();
    const viewScaleInfo = sharer.getActiveViewScaleInfo();
    return {
      viewSizeInfo,
      viewScaleInfo,
    };
  }

  refresh() {
    this.#board.getViewer().drawFrame();
  }

  forceRender() {
    const renderer = this.#board.getRenderer();
    const calculator = renderer.getCalculator();
    const loader = renderer.getLoader();
    const data = this.getData();
    if (data) {
      const { viewScaleInfo, viewSizeInfo } = this.getViewInfo();
      calculator.resetVirtualItemMap(data, {
        viewScaleInfo,
        viewSizeInfo,
      });
    }
    loader.reset();
    this.refresh();
  }

  setViewScale(opts: { scale: number; offsetX: number; offsetY: number }) {
    this.#board.updateViewScaleInfo(opts);
  }

  getLoadItemMap(): LoadItemMap {
    return this.#board.getRenderer().getLoadItemMap();
  }

  onBoardWatcherEvents() {
    this.#board.onWatcherEvents();
  }

  offBoardWatcherEvents() {
    this.#board.offWatcherEvents();
  }

  createMaterial<T extends MaterialType = MaterialType>(
    type: T,
    material: RecursivePartial<StrictMaterial<T>>,
    opts?: {
      viewCenter?: boolean;
    }
  ): StrictMaterial<T> {
    const { viewScaleInfo, viewSizeInfo } = this.getViewInfo();
    return createMaterial<T>(
      type,
      material || {},
      opts?.viewCenter === true
        ? {
            viewScaleInfo,
            viewSizeInfo,
          }
        : undefined
    );
  }

  updateMaterial(material: Material): ModifyRecord<'updateMaterial'> | null {
    const data: Data = this.getData() || { materials: [] };
    const id = material.id;
    const position = getMaterialPositionFromList(id, data.materials);
    const beforeMtrl = findMaterialFromListByPosition(position, data.materials);
    if (!beforeMtrl) {
      return null;
    }
    const before = toFlattenMaterial(beforeMtrl);
    const updatedMaterial = updateMaterialInListByPosition(position, material, data.materials, {
      onlyUpdateContent: true,
    }) as Material;

    const after = toFlattenMaterial(updatedMaterial);
    const loader = this.#board.getRenderer().getLoader();
    loader.resetMaterialAsset(material);
    this.#resetData(data);
    this.refresh();
    const modifyRecord: ModifyRecord<'updateMaterial'> = {
      type: 'updateMaterial',
      time: Date.now(),
      content: { method: 'updateMaterial', id, before, after },
    };
    return modifyRecord;
  }

  modifyMaterial(
    material: RecursivePartial<Omit<Material, 'id'>> & Pick<Material, 'id'>
  ): ModifyRecord<'modifyMaterial'> | null {
    const { id, ...restMaterial } = material;
    const data: Data = this.getData() || { materials: [] };
    const position = getMaterialPositionFromList(id, data.materials);
    const beforeMtrl = findMaterialFromListByPosition(position, data.materials);
    if (!beforeMtrl) {
      return null;
    }
    const modifyRecord: ModifyRecord<'modifyMaterial'> = getModifyMaterialRecord({
      modifiedMaterial: material,
      beforeMaterial: beforeMtrl,
    });
    updateMaterialInListByPosition(position, restMaterial, data.materials) as Material;
    const loader = this.#board.getRenderer().getLoader();
    loader.resetMaterialAsset({ ...material, type: beforeMtrl.type });
    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }

  modifyMaterials(
    materials: Array<RecursivePartial<Omit<Material, 'id'>> & Pick<Material, 'id'>>
  ): ModifyRecord<'modifyMaterials'> | null {
    const data: Data = this.getData() || { materials: [] };
    let modifyRecord: ModifyRecord<'modifyMaterials'> | null = null;
    const before: (FlattenLayout & { id: string })[] = [];
    const after: (FlattenLayout & { id: string })[] = [];
    materials.forEach((material) => {
      const { id, ...restMaterial } = material;
      const position = getMaterialPositionFromList(id, data.materials);
      const beforeMtrl = findMaterialFromListByPosition(position, data.materials);
      if (!beforeMtrl) {
        return null;
      }
      const tempRecord = getModifyMaterialRecord({
        modifiedMaterial: material,
        beforeMaterial: beforeMtrl,
      });
      if (tempRecord.content) {
        before.push({
          ...tempRecord.content.before,
          id,
        });
        after.push({
          ...tempRecord.content.after,
          id,
        });
      }
      updateMaterialInListByPosition(position, restMaterial, data.materials) as Material;
    });

    modifyRecord = {
      type: 'modifyMaterials',
      time: Date.now(),
      content: {
        method: 'modifyMaterials',
        before,
        after,
      },
    };

    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }

  addMaterial(
    material: Material,
    opts?: {
      position: MaterialPosition;
    }
  ): ModifyRecord<'addMaterial'> {
    const data: Data = this.getData() || { materials: [] };

    if (!opts || !opts?.position?.length) {
      data.materials.push(material);
    } else if (opts?.position) {
      const position = [...(opts?.position || [])];
      insertMaterialToListByPosition(material, position, data.materials);
    }
    const position: MaterialPosition = getMaterialPositionFromList(material.id, data.materials);
    const modifyRecord: ModifyRecord<'addMaterial'> = {
      type: 'addMaterial',
      time: Date.now(),
      content: { method: 'addMaterial', id: material.id, position, material: deepClone(material) },
    };
    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }

  deleteMaterial(id: string): ModifyRecord<'deleteMaterial'> {
    const data: Data = this.getData() || { materials: [] };
    const position = getMaterialPositionFromList(id, data.materials);
    const material = findMaterialFromListByPosition(position, data.materials);
    const modifyRecord: ModifyRecord<'deleteMaterial'> = {
      type: 'deleteMaterial',
      time: Date.now(),
      content: { method: 'deleteMaterial', id, position, material: material ? deepClone(material) : null },
    };
    if (material) {
      const loader = this.#board.getRenderer().getLoader();
      loader.resetMaterialAsset(material);
    }
    deleteMaterialInList(id, data.materials);
    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }

  moveMaterial(id: string, to: MaterialPosition): ModifyRecord<'moveMaterial'> {
    const data: Data = this.getData() || { materials: [] };
    const from = getMaterialPositionFromList(id, data.materials);

    const modifyRecord: ModifyRecord<'moveMaterial'> = {
      type: 'moveMaterial',
      time: Date.now(),
      content: { method: 'moveMaterial', id, from: [...from], to: [...to] },
    };
    const { materials: list } = moveMaterialPosition(data.materials, { from, to });
    data.materials = list;
    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }

  modifyLayout(layout: RecursivePartial<DataLayout> | null): ModifyRecord<'modifyLayout'> {
    const data: Data = this.getData() || { materials: [] };
    const modifyRecord: ModifyRecord<'modifyLayout'> = {
      type: 'modifyLayout',
      time: Date.now(),
      content: {
        method: 'modifyLayout',
        before: null,
        after: null,
      },
    };

    if (layout === null) {
      if (data.layout) {
        modifyRecord.content.before = toFlattenLayout(data.layout);
        delete data['layout'];
        this.#resetData(data);
        this.refresh();
        return modifyRecord;
      } else {
        return modifyRecord;
      }
    }

    const beforeLayout = data.layout;
    let before: FlattenLayout = {};
    const after: FlattenLayout = toFlattenLayout(layout);

    if (data.layout) {
      Object.keys(after).forEach((key: string) => {
        let val = get(beforeLayout, key);
        if (val === undefined && /(cornerRadius|strokeWidth)\[[0-9]{1,}\]$/.test(key)) {
          key = key.replace(/\[[0-9]{1,}\]$/, '');
          val = get(beforeLayout, key);
        }
        before[key] = val;
      });
      before = toFlattenLayout(before);
      modifyRecord.content.before = before;
    } else {
      data.layout = {} as any;
    }

    modifyRecord.content.after = after;
    mergeLayout(data.layout as DataLayout, layout) as DataLayout;

    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }

  modifyGlobal(global: RecursivePartial<DataGlobal> | null) {
    const data: Data = this.getData() || { materials: [] };
    const modifyRecord: ModifyRecord<'modifyGlobal'> = {
      type: 'modifyGlobal',
      time: Date.now(),
      content: {
        method: 'modifyGlobal',
        before: null,
        after: null,
      },
    };

    if (global === null) {
      if (data.global) {
        modifyRecord.content.before = toFlattenGlobal(data.global);
        delete data['global'];
        this.#resetData(data);
        this.refresh();
        return modifyRecord;
      } else {
        return modifyRecord;
      }
    }

    const beforeGlobal = data.global;
    let before: FlattenLayout = {};
    const after: FlattenLayout = toFlattenGlobal(global);

    if (data.global) {
      Object.keys(after).forEach((key: string) => {
        before[key] = get(beforeGlobal, key);
      });
      before = toFlattenGlobal(before);
      modifyRecord.content.before = before;
    } else {
      data.global = {} as any;
    }

    modifyRecord.content.after = after;
    mergeGlobal(data.global as DataGlobal, global) as DataGlobal;

    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }
}
