import {
  TypeContext,
  TypeData,
  TypeElement,
  TypeElemDesc,
  TypeHelperConfig,
} from '@idraw/types';
import util from './../util';

const { isColorStr } = util.color;

export function drawContext(ctx: TypeContext, data: TypeData, config: TypeHelperConfig) {
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
    drawElementWrapper(ctx, ele.uuid, config);
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

function drawElementWrapper(ctx: TypeContext, uuid: string, config: TypeHelperConfig) {
  if (uuid !== config?.selectedElementWrapper?.uuid) {
    return;
  }
  const wrapper = config.selectedElementWrapper;
  // draw wrapper's box
  ctx.beginPath();
  ctx.setLineDash(wrapper.lineDash);
  ctx.setLineWidth(wrapper.lineWidth);
  ctx.setStrokeStyle(wrapper.color);
  ctx.moveTo(wrapper.topLeft.x, wrapper.topLeft.y);
  ctx.lineTo(wrapper.topRight.x, wrapper.topRight.y);
  ctx.lineTo(wrapper.bottomRight.x, wrapper.bottomRight.y);
  ctx.lineTo(wrapper.bottomLeft.x, wrapper.bottomLeft.y);
  ctx.lineTo(wrapper.topLeft.x, wrapper.topLeft.y - wrapper.lineWidth / 2);
  ctx.stroke();
  ctx.closePath();

  // draw wrapper's dots
  ctx.setFillStyle(wrapper.color);
  [
    wrapper.topLeft, wrapper.top, wrapper.topRight, wrapper.right,
    wrapper.bottomRight, wrapper.bottom, wrapper.bottomLeft, wrapper.left,
  ].forEach((dot) => {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, wrapper.dotSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  })
 
}