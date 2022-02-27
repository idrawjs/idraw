import { TypeBoardOptions, TypeContext } from '@idraw/types';
import { Context } from '@idraw/util';

type TempDataDesc = {
  ctx: TypeContext,
}

function createDefaultData(opts: TypeBoardOptions) {
  const canvas = document.createElement('canvas');
  const ctx2d = canvas.getContext('2d') as CanvasRenderingContext2D;
  const ctx = new Context(ctx2d, {
    width: opts.width,
    height: opts.height,
    contextWidth: opts.contextWidth,
    contextHeight: opts.contextHeight,
    devicePixelRatio: opts.devicePixelRatio || window.devicePixelRatio || 1,
  });

  return {
    plugins: [],
    ctx: ctx
  }
}



export class TempData {

  private _temp: TempDataDesc

  constructor(opts: TypeBoardOptions) {
    this._temp = createDefaultData(opts)
  }

  set<T extends keyof TempDataDesc >(name: T, value:  TempDataDesc[T]) {
    this._temp[name] = value;
  }

  get<T extends keyof TempDataDesc >(name: T): TempDataDesc[T] {
    return this._temp[name];
  }

  clear(opts: TypeBoardOptions) {
    this._temp = createDefaultData(opts)
  }
}