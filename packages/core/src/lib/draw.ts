import { TypeContext, TypeData, TypeElement, TypeElemDesc } from '@idraw/types';

export function drawContext(ctx: TypeContext, data: TypeData) {
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