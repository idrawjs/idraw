import { Core, MiddlewareSelector, MiddlewareScroller, MiddlewareScaler, MiddlewareRuler, MiddlewareTextEditor, middlewareEventSelect } from '@idraw/core';
import type { PointSize, IDrawOptions, Data, ViewSizeInfo, ElementType, Element, RecursivePartial, ElementPosition } from '@idraw/types';
import type { IDrawEvent } from './event';
import {
  createElement,
  insertElementToListByPosition,
  updateElementInList,
  deleteElementInList,
  moveElementPosition,
  getElementPositionFromList
} from '@idraw/util';

export class iDraw {
  #core: Core<IDrawEvent>;
  #opts: IDrawOptions;

  constructor(mount: HTMLDivElement, opts: IDrawOptions) {
    const { width, height, devicePixelRatio } = opts;
    const core = new Core<IDrawEvent>(mount, { width, height, devicePixelRatio });
    this.#core = core;
    this.#opts = opts;
    this.#init();
  }

  #init() {
    const { disableRuler, disableScale, disableScroll, disableSelect, disableTextEdit } = this.#opts;
    const core = this.#core;
    disableScroll !== true && core.use(MiddlewareScroller);
    disableSelect !== true && core.use(MiddlewareSelector);
    disableScale !== true && core.use(MiddlewareScaler);
    disableRuler !== true && core.use(MiddlewareRuler);
    disableTextEdit !== true && core.use(MiddlewareTextEditor);
  }

  setData(data: Data) {
    const core = this.#core;
    core.setData(data);
    core.trigger('change', { data, type: 'set-data' });
  }

  getData(): Data | null {
    return this.#core.getData();
  }

  scale(opts: { scale: number; point: PointSize }) {
    this.#core.scale(opts);
  }

  setViewScale(opts: { scale: number; offsetX: number; offsetY: number }) {
    const core = this.#core;
    core.setViewScale(opts);
    core.refresh();
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

  trigger<T extends keyof IDrawEvent>(name: T, e: IDrawEvent[T]) {
    this.#core.trigger(name, e);
  }

  selectElement(uuid: string) {
    this.selectElements([uuid]);
  }

  selectElements(uuids: string[]) {
    this.trigger(middlewareEventSelect, { uuids });
  }

  selectElementByPosition(position: ElementPosition) {
    this.selectElementsByPositions([position]);
  }

  selectElementsByPositions(positions: ElementPosition[]) {
    this.trigger(middlewareEventSelect, { positions });
  }

  cancelElements() {
    this.trigger(middlewareEventSelect, { uuids: [] });
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
    core.trigger('change', { data, type: 'update-element' });
  }

  addElement(
    element: Element,
    opts?: {
      position: ElementPosition;
    }
  ): Data {
    const core = this.#core;
    const data: Data = core.getData() || { elements: [] };
    if (!opts) {
      data.elements.push(element);
    } else if (opts?.position) {
      insertElementToListByPosition(element, opts?.position, data.elements);
    }
    core.setData(data);
    core.refresh();
    core.trigger('change', { data, type: 'add-element' });
    return data;
  }

  deleteElement(uuid: string) {
    const core = this.#core;
    const data: Data = core.getData() || { elements: [] };
    deleteElementInList(uuid, data.elements);
    core.setData(data);
    core.refresh();
    core.trigger('change', { data, type: 'delete-element' });
  }

  moveElement(uuid: string, to: ElementPosition) {
    const core = this.#core;
    const data: Data = core.getData() || { elements: [] };
    const from = getElementPositionFromList(uuid, data.elements);
    const list = moveElementPosition(data.elements, { from, to });
    data.elements = list;
    core.setData(data);
    core.refresh();
    core.trigger('change', { data, type: 'move-element' });
  }
}
