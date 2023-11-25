import { Core, MiddlewareSelector, MiddlewareScroller, MiddlewareScaler, MiddlewareRuler, MiddlewareTextEditor, middlewareEventSelect } from '@idraw/core';
import type { PointSize, IDrawOptions, Data, ViewSizeInfo } from '@idraw/types';
import type { IDrawEvent } from './event';

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

  selectElements(uuids: string[]) {
    this.trigger(middlewareEventSelect, { uuids });
  }

  // selectElementByIndex() {
  //   // TODO
  // }

  cancelElement() {
    // TODO
  }

  // cancelElementByIndex() {
  //   // TODO
  // }

  updateElement() {
    // TODO
  }

  addElement() {
    // TODO
  }

  deleteElement() {
    // TODO
  }

  moveUpElement() {
    // TODO
  }

  moveDownElement() {
    // TODO
  }

  insertElementBefore() {
    // TODO
  }

  insertElementBeforeIndex() {
    // TODO
  }

  insertElementAfter() {
    // TODO
  }

  insertElementAfterIndex() {
    // TODO
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
