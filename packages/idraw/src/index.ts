import { Core, MiddlewareSelector, MiddlewareScroller } from '@idraw/core';
import type { IDrawOptions, Data } from '@idraw/types';

export class iDraw {
  private _core: Core;
  private _opts: IDrawOptions;

  constructor(mount: HTMLDivElement, opts: IDrawOptions) {
    const core = new Core(mount, opts);
    this._core = core;
    this._opts = opts;
    core.use(MiddlewareScroller);
    core.use(MiddlewareSelector);
  }

  setData(data: Data) {
    this._core.setData(data);
  }

  scale(num: number) {
    this._core.scale(num);
  }

  scrollX(num: number) {
    this._core.scrollX(num);
  }

  scrollY(num: number) {
    this._core.scrollY(num);
  }
}
