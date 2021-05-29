import {
  TypeContext,
  TypePoint,
  TypeData,
  TypeHelperWrapperDotDirection,
  // TypeElement,
  // TypeElemDesc,
} from '@idraw/types';
import util from './../util';
import { translateRotateAngle, translateRotateCenter } from './calculate';

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
      const angle = translateRotateAngle(ele.angle);
      const center = translateRotateCenter(ele);
    
      if (angle > 0 || angle < 0) {
        ctx.translate(center.x, center.y);
        ctx.rotate(angle);
        ctx.translate(0 - center.x, 0 - center.y);
      }

      ctx.beginPath();
      ctx.moveTo(ele.x, ele.y);
      ctx.lineTo(ele.x + ele.w, ele.y);
      ctx.lineTo(ele.x + ele.w, ele.y + ele.h);
      ctx.lineTo(ele.x, ele.y + ele.h);
      ctx.lineTo(ele.x, ele.y);

      ctx.rect(ele.x, ele.y, ele.w, ele.h);
      ctx.closePath();
      if (ctx.isPointInPath(p.x, p.y)) {
        idx = i;
        uuid = ele.uuid;
      }

      // reset rotate
      if (angle > 0 || angle < 0) {
        ctx.translate(center.x, center.y);
        ctx.rotate(0 - angle);
        ctx.translate(0 - center.x, 0 - center.y);
      }

      if (idx >= 0) {
        break;
      }
    }
    return [idx, uuid];
  }

  dragElement(data: TypeData, uuid: string, point: TypePoint, prevPoint: TypePoint, scale: number) {
    const index = this.getElementIndex(data, uuid);
    if (!data.elements[index]) {
      return;
    }
    const moveX = point.x - prevPoint.x;
    const moveY = point.y - prevPoint.y;
    data.elements[index].x += (moveX / scale);
    data.elements[index].y += (moveY / scale);
  }

  transformElement(data: TypeData, uuid: string, point: TypePoint, prevPoint: TypePoint, scale: number, direction: TypeHelperWrapperDotDirection) {
    const index = this.getElementIndex(data, uuid);
    if (!data.elements[index]) {
      return;
    }
    const moveX = (point.x - prevPoint.x) / scale;
    const moveY = (point.y - prevPoint.y) / scale;
    const elem = data.elements[index];

    switch (direction) {
      case 'top-left': {
        elem.x += moveX;
        elem.y += moveY;
        elem.w -= moveX;
        elem.h -= moveY;
        break;
      };
      case 'top': {
        elem.y += moveY;
        elem.h -= moveY;
        break;
      };
      case 'top-right': {
        elem.y += moveY;
        elem.w += moveX;
        elem.h -= moveY;
        break;
      };
      case 'right': {
        elem.w += moveX;
        break;
      };
      case 'bottom-right': {
        elem.w += moveX;
        elem.h += moveY;
        break;
      };
      case 'bottom': {
        elem.h += moveY;
        break;
      };
      case 'bottom-left': {
        elem.x += moveX;
        elem.w -= moveX;
        elem.h += moveY;
        break;
      };
      case 'left': {
        elem.x += moveX;
        elem.w -= moveX;
        break;
      };
      default: {
        break;
      }
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
