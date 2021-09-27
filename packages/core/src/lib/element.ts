import {
  TypeContext,
  TypePoint,
  TypeData,
  TypeHelperWrapperDotDirection,
  TypeElement,
  TypeElemDesc,
} from '@idraw/types';
import util from '@idraw/util';
import { rotateElement } from './transform';
import { calcRadian, calcElementCenter, parseRadianToAngle } from './calculate';
import { limitAngle, limitNum } from './value';

const { createUUID } = util.uuid;

export class Element {
  private _ctx: TypeContext;

  constructor(ctx: TypeContext) {
    this._ctx = ctx;
  }

  initData (data: TypeData): TypeData {
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
    let uuid = null;
    for (let i = data.elements.length - 1; i >= 0; i--) {
      const ele = data.elements[i];
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
        ctx.lineTo(ele.x, ele.y);

        ctx.rect(ele.x, ele.y, ele.w, ele.h);
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

  dragElement(data: TypeData, uuid: string, point: TypePoint, prevPoint: TypePoint, scale: number): void {
    const index = this.getElementIndex(data, uuid);
    if (!data.elements[index]) {
      return;
    }
    const moveX = point.x - prevPoint.x;
    const moveY = point.y - prevPoint.y;
    data.elements[index].x += (moveX / scale);
    data.elements[index].y += (moveY / scale);
    this.limitElementAttrs(data.elements[index]);
  }

  transformElement(
    data: TypeData,
    uuid: string,
    point: TypePoint,
    prevPoint: TypePoint,
    scale: number,
    direction: TypeHelperWrapperDotDirection
  ): null | {
    width: number,
    height: number,
    angle: number,
  } {
    const index = this.getElementIndex(data, uuid);
    if (!data.elements[index]) {
      return null;
    }
    if (data.elements[index]?.operation?.lock === true) {
      return null;
    }
    let moveX = (point.x - prevPoint.x) / scale;
    let moveY = (point.y - prevPoint.y) / scale;
    const elem = data.elements[index];
    // const { devicePixelRatio } = this._ctx.getSize();

    // if (typeof elem.angle === 'number' && (elem.angle > 0 || elem.angle < 0)) {
    //   moveY = (point.y - prevPoint.y) / scale;
    // }

    if ([
      'top-left', 'top', 'top-right', 'right', 
      'bottom-right', 'bottom', 'bottom-left', 'left'
    ].includes(direction)) {
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
      angle: limitAngle(elem.angle || 0),
    };
  }

  getElementIndex(data: TypeData, uuid: string): number {
    let idx = -1;
    for (let i = 0; i < data.elements.length; i++) {
      if (data.elements[i].uuid === uuid) {
        idx = i;
        break;
      }
    }
    return idx;
  }

  limitElementAttrs(elem: TypeElement<keyof TypeElemDesc>) {
    elem.x = limitNum(elem.x);
    elem.y = limitNum(elem.y);
    elem.w = limitNum(elem.w);
    elem.h = limitNum(elem.h);
    elem.angle = limitAngle(elem.angle || 0);
  }
  
}


function calcuScaleElemPosition(
  elem: TypeElement<keyof TypeElemDesc>,
  moveX: number,
  moveY: number,
  direction: TypeHelperWrapperDotDirection,
  scale: number,
): TypePoint & { w: number, h: number } {
  const p = { x: elem.x, y: elem.y, w: elem.w, h: elem.h };
  let angle = elem.angle;
  if (angle < 0) {
    angle = Math.max(0, 360 + angle);
  }
  switch (direction) {
    case 'top-left': {
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
      
      if (elem.w - moveX > 0 && elem.h - moveY > 0)  {
        p.x += moveX;
        p.y += moveY;
        p.w -= moveX;
        p.h -= moveY;
      }
      
      
      break;
    }
    case 'top': {
      if (elem.angle === 0) {
        if (p.h - moveY > 0) {
          p.y += moveY;
          p.h -= moveY;
        }
      } else if (elem.angle > 0 || elem.angle < 0) {
        const angle = elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
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
          p.h = p.h + moveDist;
          p.x = centerX - p.w / 2;
          p.y = centerY - p.h / 2;
        }
      } else {
        if (p.h - moveY > 0) {
          p.y += moveY;
          p.h -= moveY;
        }
      }
      break;
    }
    case 'top-right': {
      // if (elem.angle === 0) {
        if (p.h - moveY > 0) {
          p.y += moveY;
          p.h -= moveY;
        }
      // } else if (elem.angle > 0 || elem.angle < 0) {
      //   const angle = elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
      //   let moveDist = moveY;
      //   let centerX = p.x + elem.w / 2;
      //   let centerY = p.y + elem.h / 2;
      //   if (angle < 90) {
      //     moveDist = -moveY; // TODO
      //     const radian = parseRadian(angle);
      //     const centerMoveDist = moveDist / 2;
      //     centerX = centerX + centerMoveDist * Math.sin(radian);
      //     centerY = centerY - centerMoveDist * Math.cos(radian);
      //   } else if (angle < 180) {
      //     moveDist = moveX;  // TODO
      //     const radian = parseRadian(angle - 90);
      //     const centerMoveDist = moveDist / 2;
      //     centerX = centerX + centerMoveDist * Math.cos(radian);
      //     centerY = centerY + centerMoveDist * Math.sin(radian);
      //   } else if (angle < 270) {
      //     moveDist = moveY;  // TODO
      //     const radian = parseRadian(angle - 180);
      //     const centerMoveDist = moveDist / 2;
      //     centerX = centerX - centerMoveDist * Math.sin(radian);
      //     centerY = centerY + centerMoveDist * Math.cos(radian);
      //   } else if (angle < 360) {
      //     moveDist = -moveX;  // TODO
      //     const radian = parseRadian(angle - 270);
      //     const centerMoveDist = moveDist / 2;
      //     centerX = centerX - centerMoveDist * Math.cos(radian);
      //     centerY = centerY - centerMoveDist * Math.sin(radian);
      //   }
      //   if (p.h + moveDist > 0) {
      //     p.h = p.h + moveDist;
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
      if (elem.angle === 0) {
        if (elem.w + moveX > 0) {
          p.w += moveX;
        }
      } else if (elem.angle > 0 || elem.angle < 0) {
        const angle = elem.angle > 0 ? elem.angle : Math.max(0, elem.angle + 360);
        let moveDist = moveY;
        let centerX = p.x + elem.w / 2;
        let centerY = p.y + elem.h / 2;
        if (angle < 90) {
          moveDist = -moveY; // TODO
          const radian = parseRadian(angle);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.sin(radian);
          centerY = centerY - centerMoveDist * Math.cos(radian);
        } else if (angle < 180) {
          moveDist = moveX;  // TODO
          const radian = parseRadian(angle - 90);
          const centerMoveDist = moveDist / 2;
          centerX = centerX + centerMoveDist * Math.cos(radian);
          centerY = centerY + centerMoveDist * Math.sin(radian);
        } else if (angle < 270) {
          moveDist = moveY;  // TODO
          const radian = parseRadian(angle - 180);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.sin(radian);
          centerY = centerY + centerMoveDist * Math.cos(radian);
        } else if (angle < 360) {
          moveDist = -moveX;  // TODO
          const radian = parseRadian(angle - 270);
          const centerMoveDist = moveDist / 2;
          centerX = centerX - centerMoveDist * Math.cos(radian);
          centerY = centerY - centerMoveDist * Math.sin(radian);
        }
        if (p.h + moveDist > 0) {
          p.h = p.h + moveDist;
          p.x = centerX - p.w / 2;
          p.y = centerY - p.h / 2;
        }
      } else {
        if (elem.w + moveX > 0) {
          p.w += moveX;
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
      if (elem.h + moveY > 0) {
        p.h += moveY;
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
      if (elem.w - moveX > 0) {
        p.x += moveX;
        p.w -= moveX;
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
  return angle * Math.PI / 180;
}

// function getMoveDistance(elem: TypeElement<keyof TypeElemDesc>,
//   moveX: number,
//   moveY: number,
//   direction: TypeHelperWrapperDotDirection,
//   scale: number,
// ): {
//   distanceX: number,
//   distanceY: number,
//   distance: number,
//   distanceLength: number,
// } {
//   const p = { x: elem.x, y: elem.y, w: elem.w, h: elem.h };
//   let angle = elem.angle;
//   if (angle < 0) {
//     angle = Math.max(0, 360 + angle);
//   }
//   let distanceX: number = moveX;
//   let distanceY: number = moveY;
//   let distanceLength: number = Math.sqrt(moveX * moveX + moveY * moveY);
//   let distance: number = distanceLength;
//   switch (direction) {
//     case 'top-left': {
//       break;
//     }
//     case 'top': {
//       if (elem.angle === 0) {
//         distance = moveY > 0 ? distance : -distance;
//       } else if (elem.angle > 0 || elem.angle < 0) {
//         distance = moveY > 0 ? distance : -distance;
//         if (angle < 90) {
//           moveDist = -moveY; // TODO
//         } else if (angle < 180) {
//           moveDist = moveX;  // TODO
//           const radian = parseRadian(angle - 90);
//           const centerMoveDist = moveDist / 2;
//           centerX = centerX + centerMoveDist * Math.cos(radian);
//           centerY = centerY + centerMoveDist * Math.sin(radian);
//         } else if (angle < 270) {
//           moveDist = moveY;  // TODO
//           const radian = parseRadian(angle - 180);
//           const centerMoveDist = moveDist / 2;
//           centerX = centerX - centerMoveDist * Math.sin(radian);
//           centerY = centerY + centerMoveDist * Math.cos(radian);
//         } else if (angle < 360) {
//           moveDist = -moveX;  // TODO
//           const radian = parseRadian(angle - 270);
//           const centerMoveDist = moveDist / 2;
//           centerX = centerX - centerMoveDist * Math.cos(radian);
//           centerY = centerY - centerMoveDist * Math.sin(radian);
//         }
//         if (p.h + moveDist > 0) {
//           p.h = p.h + moveDist;
//           p.x = centerX - p.w / 2;
//           p.y = centerY - p.h / 2;
//         }
//       } else {
//         if (p.h - moveY > 0) {
//           p.y += moveY;
//           p.h -= moveY;
//         }
//       }
//       break;
//     }
//     case 'top-right': {
//       if (elem.h - moveY > 0 && elem.w + moveX > 0) {
//         p.y += moveY;
//         p.w += moveX;
//         p.h -= moveY;
//       }
//       break;
//     }
//     case 'right': {
//       if (elem.w + moveX > 0) {
//         p.w += moveX;
//       }
//       break;
//     }
//     case 'bottom-right': {
//       if (elem.w + moveX > 0 && elem.h + moveY > 0) {
//         p.w += moveX;
//         p.h += moveY;
//       }
//       break;
//     }
//     case 'bottom': {
//       if (elem.h + moveY > 0) {
//         p.h += moveY;
//       }
//       break;
//     }
//     case 'bottom-left': {
//       if (elem.w - moveX > 0 && elem.h + moveY > 0) {
//         p.x += moveX;
//         p.w -= moveX;
//         p.h += moveY;
//       }
//       break;
//     }
//     default: {
//       break;
//     }
//   }
//   return { distanceX, distanceY, distanceLength, distance };
// }


function calcMoveDist(moveX: number, moveY: number) {
  return Math.sqrt(moveX * moveX + moveY * moveY);
}

function changeMoveDistDirect(moveDist: number, moveDirect: number) {
  return moveDirect > 0 ? Math.abs(moveDist) : 0 - Math.abs(moveDist);
}