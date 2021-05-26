import { TypeContext, TypeData, TypeElement, TypeElemDesc } from '@idraw/types';
import util from './../util';

const { isColorStr } = util.color;

export function drawContext(ctx: TypeContext, data: TypeData) {
  if (typeof data.bgColor === 'string' && isColorStr(data.bgColor)) {
    drawBgColor(ctx, data.bgColor);
  }
  for (let i = 0; i < data.elements.length; i++) {
    const ele = data.elements[i];
    switch (ele.type) {
      case 'rect': {
        drawRect<'rect'>(ctx, ele as TypeElement<'rect'>);
      };
      default: {
        // nothing
      }
    }
  }
}


function drawRect<T extends keyof TypeElemDesc>(ctx: TypeContext, ele: TypeElement<T>) {
  const desc = ele.desc as TypeElemDesc['rect'];
  ctx.setFillStyle(desc.color);
  ctx.fillRect(ele.x, ele.y, ele.w, ele.h);
}

function drawBgColor(ctx: TypeContext, color: string) {
  const size = ctx.getSize();
  ctx.setFillStyle(color);
  ctx.fillRect(0, 0, size.width, size.height);
}