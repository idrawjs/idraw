import {
  TypeContext,
  TypeData,
  TypeElement,
  TypeElemDesc,
  TypeHelperConfig,
  // TypePoint,
} from '@idraw/types';
import util from './../util';
import { translateRotateAngle, translateRotateCenter } from './calculate';

const { isColorStr } = util.color;

export function drawContext(ctx: TypeContext, data: TypeData, config: TypeHelperConfig) {
  const size = ctx.getSize();
  ctx.clearRect(0, 0, size.width, size.height)

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

  drawElementWrapper(ctx, config);
}


function drawRect<T extends keyof TypeElemDesc>(ctx: TypeContext, ele: TypeElement<T>) {
  const desc = ele.desc as TypeElemDesc['rect'];

  const angle = translateRotateAngle(ele.angle);
  const center = translateRotateCenter(ele);
  
  if (angle > 0 || angle < 0) {
    ctx.translate(center.x, center.y);
    ctx.rotate(angle);
    ctx.translate(0 - center.x, 0 - center.y);
  }
  
  ctx.setFillStyle(desc.color);
  ctx.fillRect(ele.x, ele.y, ele.w, ele.h);

  // reset rotate
  if (angle > 0 || angle < 0) {
    ctx.translate(center.x, center.y);
    ctx.rotate(0 - angle);
    ctx.translate(0 - center.x, 0 - center.y);
  }
}

function drawBgColor(ctx: TypeContext, color: string) {
  const size = ctx.getSize();
  ctx.setFillStyle(color);
  ctx.fillRect(0, 0, size.width, size.height);
}

function drawElementWrapper(ctx: TypeContext, config: TypeHelperConfig) {
  if (!config?.selectedElementWrapper) {
    return;
  }
  const wrapper = config.selectedElementWrapper;

  if (typeof wrapper.angle === 'number' && wrapper.translate) {
    ctx.translate(wrapper.translate.x, wrapper.translate.y);
    ctx.rotate(wrapper.angle);
    ctx.translate(0 - wrapper.translate.x, 0 - wrapper.translate.y);
  }

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
  });

  // reset rotate
  if (typeof wrapper.angle === 'number' && wrapper.translate) {
    ctx.translate(wrapper.translate.x, wrapper.translate.y);
    ctx.rotate(0 - wrapper.angle);
    ctx.translate(0 - wrapper.translate.x, 0 - wrapper.translate.y);
  }
}
