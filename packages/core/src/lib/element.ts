/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  IDrawContext,
  Point,
  IDrawData,
  HelperWrapperControllerDirection,
  DataElement,
  DataElemDesc
} from '@idraw/types';
import { createUUID } from '@idraw/util';
import { rotateElement } from './transform';
import { calcRadian, calcElementCenter, parseRadianToAngle } from './calculate';
import { limitAngle, limitNum } from './value';
import { LIMIT_QBLIQUE_ANGLE } from './../constant/element';

const limitQbliqueAngle = LIMIT_QBLIQUE_ANGLE;

export class Element {
  private _ctx: IDrawContext;

  constructor(ctx: IDrawContext) {
    this._ctx = ctx;
  }

  initData(data: IDrawData): IDrawData {
    data.elements.forEach((elem) => {
      if (!(elem.uuid && typeof elem.uuid === 'string')) {
        elem.uuid = createUUID();
      }
    });
    return data;
  }

  isPointInElement(p: Point, data: IDrawData): [number, string | null] {
    const ctx = this._ctx;
    let idx = -1;
    let uuid = null;
    for (let i = data.elements.length - 1; i >= 0; i--) {
      const ele = data.elements[i];
      if (ele.operation?.invisible === true) continue;
      let bw = 0;
      // @ts-ignore
      if (ele.desc?.borderWidth > 0) {
        // @ts-ignore
        bw = ele.desc.borderWidth;
      }

      rotateElement(ctx, ele, () => {
        ctx.beginPath();
        ctx.moveTo(ele.x - bw, ele.y - bw);
        ctx.lineTo(ele.x + ele.w + bw, ele.y - bw);
        ctx.lineTo(ele.x + ele.w + bw, ele.y + ele.h + bw);
        ctx.lineTo(ele.x - bw, ele.y + ele.h + bw);
        ctx.lineTo(ele.x - bw, ele.y - bw);
        ctx.closePath();
        if (ctx.isPointInPath(p.x, p.y)) {
          idx = i;
          uuid = ele.uuid;
        }
      });

      if (idx >= 0) {
        break;
      }
    }
    return [idx, uuid];
  }

  dragElement(
    data: IDrawData,
    uuid: string,
    point: Point,
    prevPoint: Point,
    scale: number
  ): void {
    const index = this.getElementIndex(data, uuid);
    if (!data.elements[index]) {
      return;
    }
    const moveX = point.x - prevPoint.x;
    const moveY = point.y - prevPoint.y;
    data.elements[index].x += moveX / scale;
    data.elements[index].y += moveY / scale;
    this.limitElementAttrs(data.elements[index]);
  }

  transformElement(
    data: IDrawData,
    uuid: string,
    point: Point,
    prevPoint: Point,
    scale: number,
    direction: HelperWrapperControllerDirection
  ): null | {
    width: number;
    height: number;
    angle: number;
  } {
    const index = this.getElementIndex(data, uuid);
    if (!data.elements[index]) {
      return null;
    }
    if (data.elements[index]?.operation?.lock === true) {
      return null;
    }
    const moveX = (point.x - prevPoint.x) / scale;
    const moveY = (point.y - prevPoint.y) / scale;
    const elem = data.elements[index];
    // const { devicePixelRatio } = this._ctx.getSize();

    // if (typeof elem.angle === 'number' && (elem.angle > 0 || elem.angle < 0)) {
    //   moveY = (point.y - prevPoint.y) / scale;
    // }

    if (
      [
        'top-left',
        'top',
        'top-right',
        'right',
        'bottom-right',
        'bottom',
        'bottom-left',
        'left'
      ].includes(direction)
    ) {
      const p = calcuScaleElemPosition(elem, moveX, moveY, direction, scale);
      elem.x = p.x;
      elem.y = p.y;
      elem.w = p.w;
      elem.h = p.h;
    } else if (direction === 'rotate') {
      const center = calcElementCenter(elem);
      const radian = calcRadian(center, prevPoint, point);
      elem.angle = (elem.angle || 0) + parseRadianToAngle(radian);
    }

    this.limitElementAttrs(elem);

    return {
      width: limitNum(elem.w),
      height: limitNum(elem.h),
      angle: limitAngle(elem.angle || 0)
    };
  }

  getElementIndex(data: IDrawData, uuid: string): number {
    let idx = -1;
    for (let i = 0; i < data.elements.length; i++) {
      if (data.elements[i].uuid === uuid) {
        idx = i;
        break;
      }
    }
    return idx;
  }

  limitElementAttrs(elem: DataElement<keyof DataElemDesc>) {
    elem.x = limitNum(elem.x);
    elem.y = limitNum(elem.y);
    elem.w = limitNum(elem.w);
    elem.h = limitNum(elem.h);
    elem.angle = limitAngle(elem.angle || 0);
  }
}

function calcuScaleElemPosition(
  elem: DataElement<keyof DataElemDesc>,
  moveX: number,
  moveY: number,
  direction: HelperWrapperControllerDirection,
  scale: number
): Point & { w: number; h: number } {
  const p = { x: elem.x, y: elem.y, w: elem.w, h: elem.h };
  let angle = elem.angle;
  if (angle < 0) {
    angle = Math.max(0, 360 + angle);
  }
  if (elem.operation?.limitRatio === true) {
    if (
      ['top-left', 'top-right', 'bottom-right', 'bottom-left'].includes(
        direction
      )
    ) {
      const maxDist = Math.max(Math.abs(moveX), Math.abs(moveY));
      moveX = (moveX >= 0 ? 1 : -1) * maxDist;
      moveY = (((moveY >= 0 ? 1 : -1) * maxDist) / elem.w) * elem.h;
    }
  }

  switch (direction) {
    case 'top-left': {
      // TODO

      // if (elem.angle === 0) {
      //   // TODO
      // } else if (elem.angle > 0 || elem.angle < 0) {
      //   // const angle = elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
      //   if (angle < 90) {
      //     // TODO
      //   } else if (angle < 180) {
      //     // TODO
      //   } else if (angle < 270) {
      //     // TODO
      //   } else if (angle < 360) {
      //     // TODO
      //   }
      // } else {
      //   // TODO
      // }

      if (elem.w - moveX > 0 && elem.h - moveY > 0) {
        p.x += moveX;
        p.y += moveY;
        p.w -= moveX;
        p.h -= moveY;
      }

      break;
    }
    case 'top': {
      if (elem.angle === 0 || Math.abs(elem.angle) < limitQbliqueAngle) {
        if (p.h - moveY > 0) {
          p.y += moveY;
          p.h -= moveY;
          if (elem.operation?.limitRatio === true) {
            p.x += ((moveY / elem.h) * elem.w) / 2;
            p.w -= (moveY / elem.h) * elem.w;
          }
        }
      } else if (elem.angle > 0 || elem.angle < 0) {
        const angle =
          elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
        let moveDist = calcMoveDist(moveX, moveY);
        let centerX = p.x + elem.w / 2;
        let centerY = p.y + elem.h / 2;
        if (angle < 90) {
          moveDist = 0 - changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 180) {
          moveDist = changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 90);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
        } else if (angle < 270) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle - 180);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.sin(radian);
          centerY = centerY + centerMoveDist * Math.cos(radian);
        } else if (angle < 360) {
          moveDist = 0 - changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.cos(radian);
          centerY = centerY - centerMoveDist * Math.sin(radian);
        }
        if (p.h + moveDist > 0) {
          if (elem.operation?.limitRatio === true) {
            p.w = p.w + (moveDist / elem.h) * elem.w;
          }
          p.h = p.h + moveDist;
          p.x = centerX - p.w / 2;
          p.y = centerY - p.h / 2;
        }
      } else {
        if (p.h - moveY > 0) {
          p.y += moveY;
          p.h -= moveY;
          if (elem.operation?.limitRatio === true) {
            p.x -= moveX / 2;
            p.w += moveX;
          }
        }
      }
      break;
    }
    case 'top-right': {
      if (p.h - moveY > 0 && p.w + moveX > 0) {
        p.y += moveY;
        p.w += moveX;
        p.h -= moveY;
      }
      // // TODO
      // if (elem.angle === 0) {
      //   if (p.h - moveY > 0) {
      //     p.y += moveY;
      //     p.h -= moveY;
      //   }
      // } else if (elem.angle > 0 || elem.angle < 0) {
      //   const angle = elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
      //   let moveDist = calcMoveDist(moveX, moveY);
      //   let centerX = p.x + elem.w / 2;
      //   let centerY = p.y + elem.h / 2;
      //   let moveDistW: number = 0;
      //   let moveDistH: number = 0;
      //   if (angle < 90) {
      //     const radianDist = Math.atan(Math.tan(Math.abs(moveY)/Math.abs(moveX)))
      //     const radian = parseRadian(angle);
      //     const radianResult = radianDist + radian;
      //     moveDistH = moveDist * Math.sin(radianResult);
      //     moveDistW =  moveDist * Math.cos(radianResult);
      //     moveDistH = 0 - changeMoveDistDirect(moveDistH, moveY);
      //     moveDistW = changeMoveDistDirect(moveDistW, moveX);
      //     {
      //       // top direct
      //       const radian = parseRadian(angle);
      //       const centerMoveDist = moveDistH / 2;
      //       centerX = centerX + centerMoveDist * Math.sin(radian);
      //       centerY = centerY - centerMoveDist * Math.cos(radian);
      //     }
      //     {
      //       // right direct
      //       const radian = parseRadian(angle);
      //       const centerMoveDist = moveDistW / 2;
      //       centerX = centerX + centerMoveDist * Math.cos(radian);
      //       centerY = centerY + centerMoveDist * Math.sin(radian);
      //     }

      //   } else if (angle < 180) {
      //     const radianDist = Math.atan(Math.tan(Math.abs(moveX)/Math.abs(moveY)))
      //     const radian = parseRadian(angle);
      //     const radianResult = radianDist + radian;
      //     moveDistH = moveDist * Math.sin(radianResult);
      //     moveDistW = moveDist * Math.cos(radianResult);
      //     moveDistH = changeMoveDistDirect(moveDistH, moveY);
      //     moveDistW = changeMoveDistDirect(moveDistW, moveX);
      //     {
      //       // top direct
      //       const radian = parseRadian(angle - 90);
      //       const centerMoveDist = moveDistH / 2;
      //       centerX = centerX + centerMoveDist * Math.cos(radian);
      //       centerY = centerY + centerMoveDist * Math.sin(radian);
      //     }
      //     {
      //       // right direct TODO
      //       const radian = parseRadian(angle - 90);
      //       const centerMoveDist = moveDistW / 2;
      //       centerX = centerX - centerMoveDist * Math.sin(radian);
      //       centerY = centerY + centerMoveDist * Math.cos(radian);
      //     }

      //   } else if (angle < 270) {
      //     // TODO
      //   } else if (angle < 360) {
      //     // TODO
      //   }
      //   if (p.h + moveDistH > 0 && p.w + moveDistW > 0) {
      //     p.h = p.h + moveDistH;
      //     // p.w = p.w + moveDistW;
      //     p.x = centerX - p.w / 2;
      //     p.y = centerY - p.h / 2;
      //   }
      // } else {
      //   if (p.h - moveY > 0) {
      //     p.y += moveY;
      //     p.h -= moveY;
      //   }
      // }
      break;
    }
    case 'right': {
      if (elem.angle === 0 || Math.abs(elem.angle) < limitQbliqueAngle) {
        if (elem.w + moveX > 0) {
          p.w += moveX;
          if (elem.operation?.limitRatio === true) {
            p.y -= (moveX * elem.h) / elem.w / 2;
            p.h += (moveX * elem.h) / elem.w;
          }
        }
      } else if (elem.angle > 0 || elem.angle < 0) {
        const angle =
          elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
        let moveDist = calcMoveDist(moveX, moveY);
        let centerX = p.x + elem.w / 2;
        let centerY = p.y + elem.h / 2;
        if (angle < 90) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
        } else if (angle < 180) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle - 90);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.sin(radian);
          centerY = centerY + centerMoveDist * Math.cos(radian);
        } else if (angle < 270) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle - 180);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
          moveDist = 0 - moveDist;
        } else if (angle < 360) {
          moveDist = changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        }
        if (p.w + moveDist > 0) {
          if (elem.operation?.limitRatio === true) {
            p.h = p.h + (moveDist / elem.w) * elem.h;
          }
          p.w = p.w + moveDist;
          p.x = centerX - p.w / 2;
          p.y = centerY - p.h / 2;
        }
      } else {
        if (elem.w + moveX > 0) {
          p.w += moveX;
          if (elem.operation?.limitRatio === true) {
            p.h += (moveX * elem.h) / elem.w;
            p.y -= (moveX * elem.h) / elem.w / 2;
          }
        }
      }
      break;
    }
    case 'bottom-right': {
      // if (elem.angle === 0) {
      //   // TODO
      // } else if (elem.angle > 0 || elem.angle < 0) {
      //   // const angle = elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
      //   if (angle < 90) {
      //     // TODO
      //   } else if (angle < 180) {
      //     // TODO
      //   } else if (angle < 270) {
      //     // TODO
      //   } else if (angle < 360) {
      //     // TODO
      //   }
      // } else {
      //   // TODO
      // }
      if (elem.w + moveX > 0 && elem.h + moveY > 0) {
        p.w += moveX;
        p.h += moveY;
      }
      break;
    }
    case 'bottom': {
      if (elem.angle === 0 || Math.abs(elem.angle) < limitQbliqueAngle) {
        if (elem.h + moveY > 0) {
          p.h += moveY;
          if (elem.operation?.limitRatio === true) {
            p.x -= ((moveY / elem.h) * elem.w) / 2;
            p.w += (moveY / elem.h) * elem.w;
          }
        }
      } else if (elem.angle > 0 || elem.angle < 0) {
        const angle =
          elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
        let moveDist = calcMoveDist(moveX, moveY);
        let centerX = p.x + elem.w / 2;
        let centerY = p.y + elem.h / 2;
        if (angle < 90) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.sin(radian);
          centerY = centerY + centerMoveDist * Math.cos(radian);
        } else if (angle < 180) {
          moveDist = 0 - changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 90);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.cos(radian);
          centerY = centerY - centerMoveDist * Math.sin(radian);
        } else if (angle < 270) {
          moveDist = changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 180);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 360) {
          moveDist = changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
        }
        if (p.h + moveDist > 0) {
          if (elem.operation?.limitRatio === true) {
            p.w = p.w + (moveDist / elem.h) * elem.w;
          }
          p.h = p.h + moveDist;
          p.x = centerX - p.w / 2;
          p.y = centerY - p.h / 2;
        }
      } else {
        if (elem.h + moveY > 0) {
          p.h += moveY;
          if (elem.operation?.limitRatio === true) {
            p.x -= ((moveY / elem.h) * elem.w) / 2;
            p.w += (moveY / elem.h) * elem.w;
          }
        }
      }
      break;
    }
    case 'bottom-left': {
      // if (elem.angle === 0) {
      //   // TODO
      // } else if (elem.angle > 0 || elem.angle < 0) {
      //   // const angle = elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
      //   if (angle < 90) {
      //     // TODO
      //   } else if (angle < 180) {
      //     // TODO
      //   } else if (angle < 270) {
      //     // TODO
      //   } else if (angle < 360) {
      //     // TODO
      //   }
      // } else {
      //   // TODO
      // }
      if (elem.w - moveX > 0 && elem.h + moveY > 0) {
        p.x += moveX;
        p.w -= moveX;
        p.h += moveY;
      }
      break;
    }
    case 'left': {
      if (elem.angle === 0 || Math.abs(elem.angle) < limitQbliqueAngle) {
        if (elem.w - moveX > 0) {
          p.x += moveX;
          p.w -= moveX;
          if (elem.operation?.limitRatio === true) {
            p.h -= (moveX / elem.w) * elem.h;
            p.y += ((moveX / elem.w) * elem.h) / 2;
          }
        }
      } else if (elem.angle > 0 || elem.angle < 0) {
        const angle =
          elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
        let moveDist = calcMoveDist(moveX, moveY);
        let centerX = p.x + elem.w / 2;
        let centerY = p.y + elem.h / 2;
        if (angle < 90) {
          moveDist = 0 - changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.cos(radian);
          centerY = centerY - centerMoveDist * Math.sin(radian);
        } else if (angle < 180) {
          moveDist = changeMoveDistDirect(moveDist, moveX);
          const radian = parseRadian(angle - 90);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 270) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle - 180);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
        } else if (angle < 360) {
          moveDist = changeMoveDistDirect(moveDist, moveY);
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.sin(radian);
          centerY = centerY + centerMoveDist * Math.cos(radian);
        }
        if (p.w + moveDist > 0) {
          if (elem.operation?.limitRatio === true) {
            p.h = p.h + (moveDist / elem.w) * elem.h;
          }
          p.w = p.w + moveDist;
          p.x = centerX - p.w / 2;
          p.y = centerY - p.h / 2;
        }
      } else {
        if (elem.w - moveX > 0) {
          p.x += moveX;
          p.w -= moveX;
          if (elem.operation?.limitRatio === true) {
            p.h -= (moveX / elem.w) * elem.h;
            p.y += ((moveX / elem.w) * elem.h) / 2;
          }
        }
      }
      break;
    }
    default: {
      break;
    }
  }
  return p;
}

function parseRadian(angle: number) {
  return (angle * Math.PI) / 180;
}

function calcMoveDist(moveX: number, moveY: number) {
  return Math.sqrt(moveX * moveX + moveY * moveY);
}

function changeMoveDistDirect(moveDist: number, moveDirect: number) {
  return moveDirect > 0 ? Math.abs(moveDist) : 0 - Math.abs(moveDist);
}
