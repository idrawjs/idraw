import {
  TypeContext,
  TypeHelperConfig,
} from '@idraw/types';
import { rotateContext } from './../transform';
import { clearContext } from './base';

export function drawElementWrapper(ctx: TypeContext, config: TypeHelperConfig) {
  if (!config?.selectedElementWrapper) {
    return;
  }
  const wrapper = config.selectedElementWrapper;
  clearContext(ctx);
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
    
    if (wrapper.lock !== true) {
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
        wrapper.dots.topLeft,
        wrapper.dots.top,
        wrapper.dots.topRight,
        wrapper.dots.right,
        wrapper.dots.bottomRight,
        wrapper.dots.bottom,
        wrapper.dots.bottomLeft,
        wrapper.dots.left,
      ].forEach((dot) => {
        if (dot.invisible !== true) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, wrapper.dotSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.closePath();
        }
      });
    } else {
      // draw wrapper's lock dots,
      clearContext(ctx);
      ctx.setStrokeStyle(wrapper.color);
      [
        wrapper.dots.topLeft, wrapper.dots.top, wrapper.dots.topRight, wrapper.dots.right,
        wrapper.dots.bottomRight, wrapper.dots.bottom, wrapper.dots.bottomLeft, wrapper.dots.left,
      ].forEach((dot) => {

        ctx.beginPath();
        ctx.moveTo(dot.x - wrapper.dotSize / 2, dot.y - wrapper.dotSize / 2);
        ctx.lineTo(dot.x + wrapper.dotSize / 2, dot.y + wrapper.dotSize / 2);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(dot.x + wrapper.dotSize / 2, dot.y - wrapper.dotSize / 2);
        ctx.lineTo(dot.x - wrapper.dotSize / 2, dot.y + wrapper.dotSize / 2);
        ctx.stroke();
        ctx.closePath();
      });
    }
  });
}

export function drawAreaWrapper(ctx: TypeContext, config: TypeHelperConfig) {
  if (!config?.selectedAreaWrapper) {
    return;
  }
  const wrapper = config.selectedAreaWrapper;
  if (wrapper && wrapper.w > 0 && wrapper.h > 0) {
    clearContext(ctx);
    ctx.setGlobalAlpha(0.3);
    ctx.setFillStyle(wrapper.color);
    ctx.fillRect(wrapper.x, wrapper.y, wrapper.w, wrapper.h);

    clearContext(ctx);
    ctx.beginPath();
    ctx.setLineDash(wrapper.lineDash);
    ctx.setLineWidth(wrapper.lineWidth);
    ctx.setStrokeStyle(wrapper.color);
    ctx.moveTo(wrapper.x, wrapper.y);
    ctx.lineTo(wrapper.x + wrapper.w, wrapper.y);
    ctx.lineTo(wrapper.x + wrapper.w, wrapper.y + wrapper.h);
    ctx.lineTo(wrapper.x, wrapper.y + wrapper.h);
    ctx.lineTo(wrapper.x, wrapper.y);
    ctx.stroke();
    ctx.closePath();
  }
  
}

export function drawElementListWrappers(ctx: TypeContext, config: TypeHelperConfig) {
  if (!Array.isArray(config?.selectedElementListWrappers)) {
    return;
  }
  const wrapperList = config.selectedElementListWrappers;

  wrapperList?.forEach((wrapper) => {
    clearContext(ctx);
    rotateContext(ctx, wrapper.translate, wrapper.radian || 0, () => {
      
      clearContext(ctx);
      ctx.setGlobalAlpha(0.05);
      ctx.setFillStyle(wrapper.color);
      ctx.fillRect(
        wrapper.dots.topLeft.x,
        wrapper.dots.topLeft.y,
        wrapper.dots.bottomRight.x - wrapper.dots.topLeft.x,
        wrapper.dots.bottomRight.y - wrapper.dots.topLeft.y,
      );

      clearContext(ctx);
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

      if (wrapper.lock === true) {
        // draw wrapper's lock dots,
        clearContext(ctx);
        // ctx.setFillStyle(wrapper.color);
        ctx.setStrokeStyle(wrapper.color);
        [
          wrapper.dots.topLeft, wrapper.dots.top, wrapper.dots.topRight, wrapper.dots.right,
          wrapper.dots.bottomRight, wrapper.dots.bottom, wrapper.dots.bottomLeft, wrapper.dots.left,
        ].forEach((dot) => {
          ctx.beginPath();
          ctx.moveTo(dot.x - wrapper.dotSize / 2, dot.y - wrapper.dotSize / 2);
          ctx.lineTo(dot.x + wrapper.dotSize / 2, dot.y + wrapper.dotSize / 2);
          ctx.stroke();
          ctx.closePath();

          ctx.beginPath();
          ctx.moveTo(dot.x + wrapper.dotSize / 2, dot.y - wrapper.dotSize / 2);
          ctx.lineTo(dot.x - wrapper.dotSize / 2, dot.y + wrapper.dotSize / 2);
          ctx.stroke();
          ctx.closePath();
        });
      }

    });
  });
}

