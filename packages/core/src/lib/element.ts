import { TypeContext, TypePoint, TypeData } from '@idraw/types';
import util from './../util';

const { createUUID } = util.uuid;

export class Element {
  private _ctx: TypeContext;

  constructor(ctx: TypeContext) {
    this._ctx = ctx;
  }

  initData (data: TypeData) {
    data.elements.forEach((elem) => {
      if (!(elem.uuid && typeof elem.uuid === 'string')) {
        elem.uuid = createUUID();
      }
    });
    return data;
  }

  isPointInElement(p: TypePoint, data: TypeData): [number, string | null] {
    const ctx = this._ctx;
    let idx = -1;
    let uuid = null
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
        uuid = ele.uuid;
        break;
      }
    }
    return [idx, uuid];
  }

  dragElement(data: TypeData, uuid: string, point: TypePoint, prevPoint: TypePoint, scale: number) {
    const index = this.getElementIndex(data, uuid);
    if (data.elements[index]) {
      const moveX = point.x - prevPoint.x;
      const moveY = point.y - prevPoint.y;
      data.elements[index].x += (moveX / scale);
      data.elements[index].y += (moveY / scale);
    }
  }

  getElementIndex(data: TypeData, uuid: string) {
    let idx = -1;
    for (let i = 0; i < data.elements.length; i++) {
      if (data.elements[i].uuid === uuid) {
        idx = i;
        break;
      }
    }
    return idx;
  }
  
}
