import { TypeContext, TypePoint, TypeData } from '@idraw/types';

export class Element {
  private _ctx: TypeContext;

  constructor(ctx: TypeContext) {
    this._ctx = ctx;
  }

  isPointInElement(p: TypePoint, data: TypeData) {
    const ctx = this._ctx;
    let idx = -1;
    for (let i = data.elements.length - 1; i >= 0; i--) {
      const ele = data.elements[i];
      ctx.beginPath();
      ctx.lineTo(ele.x, ele.y);
      ctx.lineTo(ele.x + ele.w, ele.y);
      ctx.lineTo(ele.x + ele.w, ele.y + ele.h);
      ctx.lineTo(ele.x, ele.y + ele.h);
      ctx.closePath();
      if (ctx.isPointInPath(p.x, p.y)) {
        idx = i;
        break;
      }
    }
    return idx;
  }
}
