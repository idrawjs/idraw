import {
  TypeContext,
  TypeHelperConfig,
} from '@idraw/types';
import { rotateContext } from './../transform'; 

export function drawElementWrapper(ctx: TypeContext, config: TypeHelperConfig) {
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
