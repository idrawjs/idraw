import {
  TypeContext,
  TypeData,
  TypeElement,
  TypeElemDesc,
  TypeHelperConfig,
  TypePoint,
} from '@idraw/types';
import util from './../util';

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
  const p = translateRotateCenter(ele, angle);
  
  if (angle > 0 || angle < 0) {
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    ctx.translate(0 - p.x, 0 - p.y);
  }
  
  ctx.setFillStyle(desc.color);
  ctx.fillRect(ele.x, ele.y, ele.w, ele.h);

  // reset rotate
  if (angle > 0 || angle < 0) {
    ctx.translate(p.x, p.y);
    ctx.rotate(0 - angle);
    ctx.translate(0 - p.x, 0 - p.y);
  }
}

function drawBgColor(ctx: TypeContext, color: string) {
  const size = ctx.getSize();
  ctx.setFillStyle(color);
  ctx.fillRect(0, 0, size.width, size.height);
}

function drawElementWrapper(ctx: TypeContext, config: TypeHelperConfig) {
  // if (uuid !== config?.selectedElementWrapper?.uuid) {
  //   return;
  // }
  if (!config?.selectedElementWrapper) {
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
  });
}


function translateRotateCenter(elem: TypeElement<keyof TypeElemDesc>, angle: number): TypePoint {
  // const p = {
  //   x: elem.x + elem.w / 2 - Math.sqrt(elem.h * elem.h + elem.w * elem.w) / 2 * Math.sin(Math.PI / 4 - angle),
  //   y: elem.y + elem.h / 2 - Math.sqrt(elem.h * elem.h + elem.w * elem.w) / 2 * Math.cos(Math.PI / 4 - angle),
  // };
  const p = {
    x: elem.x + elem.w / 2,
    y: elem.y + elem.h / 2,
  };
  // const p = {
  //   x: elem.w / 2,
  //   y: elem.h / 2,
  // };
  return p;
}

function translateRotateAngle(angle?: number) {
  if (typeof angle === 'number' && (angle > 0 || angle <= 0)) {
    const _angle = angle / 360 * (2 * Math.PI);
    return _angle;
  } else {
    return 0;
  }
}