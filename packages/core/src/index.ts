import type {
  Data,
  PointSize,
  CoreOptions,
  Middleware,
  ViewSizeInfo,
  CoreEventMap,
  ViewScaleInfo,
  LoadItemMap,
  ElementType,
  RecursivePartial,
  Element,
  ModifyRecord,
  ElementPosition,
  DataLayout,
  FlattenLayout,
  DataGlobal
} from '@idraw/types';
import {
  deepClone,
  createElement,
  getElementPositionFromList,
  toFlattenElement,
  deleteElementInList,
  findElementFromListByPosition,
  updateElementInListByPosition,
  insertElementToListByPosition,
  moveElementPosition,
  toFlattenLayout,
  toFlattenGlobal,
  get,
  mergeLayout,
  mergeGlobal
} from '@idraw/util';
import { Board, Sharer, Calculator } from './board';
import { createBoardContent, validateElements } from '@idraw/util';
import { Cursor } from './cursor/cursor';
import { getModifyElementRecord } from './record';

export { coreEventKeys } from './config';
export type { CoreEventKeys } from './config';

export { Board, Sharer, Calculator };

// export { MiddlewareSelector } from './middleware/selector';
export { MiddlewareSelector } from './middlewares/selector';
export { MiddlewareScroller } from './middlewares/scroller';
export { MiddlewareScaler } from './middlewares/scaler';
export { MiddlewareRuler } from './middlewares/ruler';
export { MiddlewareTextEditor } from './middlewares/text-editor';
export { MiddlewareDragger } from './middlewares/dragger';
export { MiddlewareInfo } from './middlewares/info';
export { MiddlewareLayoutSelector } from './middlewares/layout-selector';
export { MiddlewarePointer } from './middlewares/pointer';

export class Core<E extends CoreEventMap = CoreEventMap> {
  #board: Board<E>;
  // #opts: CoreOptions;
  #canvas: HTMLCanvasElement;
  #container: HTMLDivElement;

  constructor(container: HTMLDivElement, opts: CoreOptions) {
    const { devicePixelRatio = 1, width, height, disableWatcher = false } = opts;

    // this.#opts = opts;
    this.#container = container;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('tabindex', '0');
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
      contextHeight: height
    });
    this.#board = board;
    this.resize(sharer.getActiveViewSizeInfo());
    const eventHub = board.getEventHub();
    new Cursor(container, {
      eventHub
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
    const container = this.#container;
    container.style.position = 'relative';
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
    validateElements(data?.elements || []);
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

  scale(opts: { scale: number; point: PointSize }) {
    this.#board.scale(opts);
    const viewer = this.#board.getViewer();
    viewer.drawFrame();
  }

  resize(newViewSize: Partial<ViewSizeInfo>) {
    const board = this.#board;
    const sharer = board.getSharer();
    const viewSizeInfo = sharer.getActiveViewSizeInfo();
    board.resize({
      ...viewSizeInfo,
      ...newViewSize
    });
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
      viewScaleInfo
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
      calculator.resetVirtualFlatItemMap(data, {
        viewScaleInfo,
        viewSizeInfo
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

  createElement<T extends ElementType = ElementType>(
    type: T,
    element: RecursivePartial<Element<T>>,
    opts?: {
      viewCenter?: boolean;
    }
  ): Element<T> {
    const { viewScaleInfo, viewSizeInfo } = this.getViewInfo();
    return createElement<T>(
      type,
      element || {},
      opts?.viewCenter === true
        ? {
            viewScaleInfo,
            viewSizeInfo
          }
        : undefined
    );
  }

  updateElement(element: Element): ModifyRecord<'updateElement'> | null {
    const data: Data = this.getData() || { elements: [] };
    const uuid = element.uuid;
    const position = getElementPositionFromList(uuid, data.elements);
    const beforeElem = findElementFromListByPosition(position, data.elements);
    if (!beforeElem) {
      return null;
    }
    const before = toFlattenElement(beforeElem);
    const updatedElement = updateElementInListByPosition(position, element, data.elements, { strict: true }) as Element;
    const after = toFlattenElement(updatedElement);
    const loader = this.#board.getRenderer().getLoader();
    loader.resetElementAsset(element);
    this.#resetData(data);
    this.refresh();
    const modifyRecord: ModifyRecord<'updateElement'> = {
      type: 'updateElement',
      time: Date.now(),
      content: { method: 'updateElement', uuid, before, after }
    };
    return modifyRecord;
  }

  modifyElement(
    element: RecursivePartial<Omit<Element, 'uuid'>> & Pick<Element, 'uuid'>
  ): ModifyRecord<'modifyElement'> | null {
    const { uuid, ...restElement } = element;
    const data: Data = this.getData() || { elements: [] };
    const position = getElementPositionFromList(uuid, data.elements);
    const beforeElem = findElementFromListByPosition(position, data.elements);
    if (!beforeElem) {
      return null;
    }
    const modifyRecord: ModifyRecord<'modifyElement'> = getModifyElementRecord({
      modifiedElement: element,
      beforeElement: beforeElem
    });
    updateElementInListByPosition(position, restElement, data.elements) as Element;
    const loader = this.#board.getRenderer().getLoader();
    loader.resetElementAsset({ ...element, type: beforeElem.type });
    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }

  modifyElements(
    elements: Array<RecursivePartial<Omit<Element, 'uuid'>> & Pick<Element, 'uuid'>>
  ): ModifyRecord<'modifyElements'> | null {
    const data: Data = this.getData() || { elements: [] };
    let modifyRecord: ModifyRecord<'modifyElements'> | null = null;
    const before: (FlattenLayout & { uuid: string })[] = [];
    const after: (FlattenLayout & { uuid: string })[] = [];
    elements.forEach((element) => {
      const { uuid, ...restElement } = element;
      const position = getElementPositionFromList(uuid, data.elements);
      const beforeElem = findElementFromListByPosition(position, data.elements);
      if (!beforeElem) {
        return null;
      }
      const tempRecord = getModifyElementRecord({
        modifiedElement: element,
        beforeElement: beforeElem
      });
      if (tempRecord.content) {
        before.push({
          ...tempRecord.content.before,
          uuid
        });
        after.push({
          ...tempRecord.content.after,
          uuid
        });
      }
      updateElementInListByPosition(position, restElement, data.elements) as Element;
    });

    modifyRecord = {
      type: 'modifyElements',
      time: Date.now(),
      content: {
        method: 'modifyElements',
        before,
        after
      }
    };

    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }

  addElement(
    element: Element,
    opts?: {
      position: ElementPosition;
    }
  ): ModifyRecord<'addElement'> {
    const data: Data = this.getData() || { elements: [] };

    if (!opts || !opts?.position?.length) {
      data.elements.push(element);
    } else if (opts?.position) {
      const position = [...(opts?.position || [])];
      insertElementToListByPosition(element, position, data.elements);
    }
    const position: ElementPosition = getElementPositionFromList(element.uuid, data.elements);
    const modifyRecord: ModifyRecord<'addElement'> = {
      type: 'addElement',
      time: Date.now(),
      content: { method: 'addElement', uuid: element.uuid, position, element: deepClone(element) }
    };
    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }

  deleteElement(uuid: string): ModifyRecord<'deleteElement'> {
    const data: Data = this.getData() || { elements: [] };
    const position = getElementPositionFromList(uuid, data.elements);
    const element = findElementFromListByPosition(position, data.elements);
    const modifyRecord: ModifyRecord<'deleteElement'> = {
      type: 'deleteElement',
      time: Date.now(),
      content: { method: 'deleteElement', uuid, position, element: element ? deepClone(element) : null }
    };
    if (element) {
      const loader = this.#board.getRenderer().getLoader();
      loader.resetElementAsset(element);
    }
    deleteElementInList(uuid, data.elements);
    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }

  moveElement(uuid: string, to: ElementPosition): ModifyRecord<'moveElement'> {
    const data: Data = this.getData() || { elements: [] };
    const from = getElementPositionFromList(uuid, data.elements);

    const modifyRecord: ModifyRecord<'moveElement'> = {
      type: 'moveElement',
      time: Date.now(),
      content: { method: 'moveElement', uuid, from: [...from], to: [...to] }
    };
    const { elements: list } = moveElementPosition(data.elements, { from, to });
    data.elements = list;
    this.#resetData(data);
    this.refresh();
    return modifyRecord;
  }

  modifyLayout(layout: RecursivePartial<DataLayout> | null): ModifyRecord<'modifyLayout'> {
    const data: Data = this.getData() || { elements: [] };
    const modifyRecord: ModifyRecord<'modifyLayout'> = {
      type: 'modifyLayout',
      time: Date.now(),
      content: {
        method: 'modifyLayout',
        before: null,
        after: null
      }
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
        if (val === undefined && /(borderRadius|borderWidth)\[[0-9]{1,}\]$/.test(key)) {
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
    const data: Data = this.getData() || { elements: [] };
    const modifyRecord: ModifyRecord<'modifyGlobal'> = {
      type: 'modifyGlobal',
      time: Date.now(),
      content: {
        method: 'modifyGlobal',
        before: null,
        after: null
      }
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
