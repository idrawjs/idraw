import { Core, MiddlewareSelector, MiddlewareScroller, MiddlewareScaler, MiddlewareRuler } from '@idraw/core';
import type { PointSize, IDrawOptions, Data, ViewSizeInfo, IDrawEvent } from '@idraw/types';

export class iDraw {
  private _core: Core;
  private _opts: IDrawOptions;

  constructor(mount: HTMLDivElement, opts: IDrawOptions) {
    const core = new Core(mount, opts);
    this._core = core;
    this._opts = opts;
    core.use(MiddlewareScroller);
    core.use(MiddlewareSelector);
    core.use(MiddlewareScaler);
    core.use(MiddlewareRuler);
  }

  setData(data: Data) {
    this._core.setData(data);
  }

  getData(): Data | null {
    return this._core.getData();
  }

  selectElement() {
    // TODO
  }

  selectElementByIndex() {
    // TODO
  }

  cancelElement() {
    // TODO
  }

  cancelElementByIndex() {
    // TODO
  }

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
    this._core.scale(opts);
  }

  resize(opts: Partial<ViewSizeInfo>) {
    this._core.resize(opts);
  }

  on<T extends keyof IDrawEvent>(name: T, callback: (e: IDrawEvent[T]) => void) {
    this._core.on(name, callback);
  }

  off<T extends keyof IDrawEvent>(name: T, callback: (e: IDrawEvent[T]) => void) {
    this._core.off(name, callback);
  }

  trigger<T extends keyof IDrawEvent>(name: T, e: IDrawEvent[T]) {
    this._core.trigger(name, e);
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
