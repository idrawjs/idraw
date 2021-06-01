import {
  TypeContext,
  TypeData,
  TypeElement,
  TypeElemDesc,
  TypeHelperConfig,
  // TypePoint,
} from '@idraw/types';
import util from '@idraw/util';
import { rotateContext, rotateElement } from './transform';
import Loader from './loader';

const { isColorStr } = util.color;

export function drawContext(
  ctx: TypeContext,
  data: TypeData,
  config: TypeHelperConfig,
  loader: Loader,
): void {
  clearContext(ctx);
  const size = ctx.getSize();
  ctx.clearRect(0, 0, size.width, size.height);

  if (typeof data.bgColor === 'string' && isColorStr(data.bgColor)) {
    drawBgColor(ctx, data.bgColor);
  }
  for (let i = 0; i < data.elements.length; i++) {
    const elem = data.elements[i];
    switch (elem.type) {
      case 'rect': {
        drawRect<'rect'>(ctx, elem as TypeElement<'rect'>);
      }
      case 'image': {
        drawImage<'image'>(ctx, elem as TypeElement<'image'>, loader);
      }
      default: {
        // nothing
      }
    }
  }

  drawElementWrapper(ctx, config);
}


function drawRect<T extends keyof TypeElemDesc>(ctx: TypeContext, elem: TypeElement<T>) {
  clearContext(ctx);
  const desc = elem.desc as TypeElemDesc['rect'];
  rotateElement(ctx, elem, () => {
    ctx.setFillStyle(desc.color);
    ctx.fillRect(elem.x, elem.y, elem.w, elem.h);
  });
}

function drawImage<T extends keyof TypeElemDesc>(
  ctx: TypeContext,
  elem: TypeElement<T>,
  loader: Loader,
) {
  // const desc = elem.desc as TypeElemDesc['rect'];
  const content = loader.getContent(elem.uuid);
  rotateElement(ctx, elem, () => {
    // ctx.setFillStyle(desc.color);
    // ctx.fillRect(elem.x, elem.y, elem.w, elem.h);
    if (content) {
      // ctx.drawImage(content, 0, 0, elem.w, elem.h, elem.x, elem.y, elem.w, elem.h);
      ctx.drawImage(content, elem.x, elem.y, elem.w, elem.h);
    }
  });
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

  rotateContext(ctx, wrapper.translate, wrapper.radian || 0, () => {
    // draw wrapper's box
    ctx.beginPath();
    ctx.setLineDash(wrapper.lineDash);
    ctx.setLineWidth(wrapper.lineWidth);
    ctx.setStrokeStyle(wrapper.color);
    ctx.moveTo(wrapper.dots.topLeft.x, wrapper.dots.topLeft.y);
    ctx.lineTo(wrapper.dots.topRight.x, wrapper.dots.topRight.y);
    ctx.lineTo(wrapper.dots.bottomRight.x, wrapper.dots.bottomRight.y);
    ctx.lineTo(wrapper.dots.bottomLeft.x, wrapper.dots.bottomLeft.y);
    ctx.lineTo(wrapper.dots.topLeft.x, wrapper.dots.topLeft.y - wrapper.lineWidth / 2);
    ctx.stroke();
    ctx.closePath();


    // draw wrapper's rotate line
    ctx.beginPath();
    ctx.moveTo(wrapper.dots.top.x, wrapper.dots.top.y);
    ctx.lineTo(wrapper.dots.rotate.x, wrapper.dots.rotate.y + wrapper.dotSize);
    ctx.stroke();
    ctx.closePath();

    // draw wrapper's rotate
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.setLineWidth(wrapper.dotSize / 2);
    ctx.arc(wrapper.dots.rotate.x, wrapper.dots.rotate.y, wrapper.dotSize * 0.8, Math.PI / 6, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    // draw wrapper's dots
    ctx.setFillStyle(wrapper.color);
    [
      wrapper.dots.topLeft, wrapper.dots.top, wrapper.dots.topRight, wrapper.dots.right,
      wrapper.dots.bottomRight, wrapper.dots.bottom, wrapper.dots.bottomLeft, wrapper.dots.left,
    ].forEach((dot) => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, wrapper.dotSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    });

  });
}


function clearContext(ctx: TypeContext) {
  ctx.setFillStyle('rgb(0 0 0 / 0%)');
  ctx.setStrokeStyle('rgb(0 0 0 / 0%)');
}