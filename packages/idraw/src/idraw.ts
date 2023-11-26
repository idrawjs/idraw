import { Core, MiddlewareSelector, MiddlewareScroller, MiddlewareScaler, MiddlewareRuler, MiddlewareTextEditor, middlewareEventSelect } from '@idraw/core';
import type { PointSize, IDrawOptions, Data, ViewSizeInfo, ElementType, Element, RecursivePartial } from '@idraw/types';
import type { IDrawEvent } from './event';
import { createElement } from '@idraw/util';

export class iDraw {
  #core: Core;
  // private #opts: IDrawOptions;

  constructor(mount: HTMLDivElement, opts: IDrawOptions) {
    const core = new Core(mount, opts);
    this.#core = core;
    // this.#opts = opts;
    core.use(MiddlewareScroller);
    core.use(MiddlewareSelector);
    core.use(MiddlewareScaler);
    core.use(MiddlewareRuler);
    core.use(MiddlewareTextEditor);
  }

  setData(data: Data) {
    this.#core.setData(data);
  }

  getData(): Data | null {
    return this.#core.getData();
  }

  scale(opts: { scale: number; point: PointSize }) {
    this.#core.scale(opts);
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

  selectElements(uuids: string[]) {
    this.trigger(middlewareEventSelect, { uuids });
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

  updateElement() {
    // TODO
  }

  addElement(
    element: Element,
    opts?: {
      uuid: string;
      referenceType: 'group' | 'front' | 'back';
    }
  ) {
    const core = this.#core;
    const data: Data = core.getData() || { elements: [] };
    if (!opts) {
      data.elements.push(element);
    } else {
      // TODO
    }
    core.setData({ ...data });
    core.refresh();
  }

  deleteElement(uuid: string) {
    // TODO
  }

  moveElementToFront(uuid: string, referenceUUID?: string) {
    // TODO
  }

  moveElementToBack(uuid: string, referenceUUID?: string) {
    // TODO
  }

  // scrollLeft() {
  //   // TODO
  // }

  // scrollTop() {
  //   // TODO
  // }

  // exportDataURL() {
  //   // TODO
  // }
}
