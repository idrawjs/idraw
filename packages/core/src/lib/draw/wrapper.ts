import { IDrawContext, HelperConfig } from '@idraw/types';
import { rotateContext } from './../transform';
import { clearContext } from './base';

export function drawElementWrapper(ctx: IDrawContext, config: HelperConfig) {
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
    ctx.moveTo(wrapper.controllers.topLeft.x, wrapper.controllers.topLeft.y);
    ctx.lineTo(wrapper.controllers.topRight.x, wrapper.controllers.topRight.y);
    ctx.lineTo(
      wrapper.controllers.bottomRight.x,
      wrapper.controllers.bottomRight.y
    );
    ctx.lineTo(
      wrapper.controllers.bottomLeft.x,
      wrapper.controllers.bottomLeft.y
    );
    ctx.lineTo(
      wrapper.controllers.topLeft.x,
      wrapper.controllers.topLeft.y - wrapper.lineWidth / 2
    );
    ctx.stroke();
    ctx.closePath();

    if (wrapper.lock !== true) {
      if (wrapper.controllers.rotate.invisible !== true) {
        // draw wrapper's rotate line
        ctx.beginPath();
        ctx.moveTo(wrapper.controllers.top.x, wrapper.controllers.top.y);
        ctx.lineTo(
          wrapper.controllers.rotate.x,
          wrapper.controllers.rotate.y + wrapper.controllerSize
        );
        ctx.stroke();
        ctx.closePath();

        // draw wrapper's rotate
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.setLineWidth(wrapper.controllerSize / 1.2);
        ctx.arc(
          wrapper.controllers.rotate.x,
          wrapper.controllers.rotate.y,
          wrapper.controllerSize * 0.8,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.closePath();

        ctx.setStrokeStyle('#FFFFFF');
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.setLineWidth(wrapper.controllerSize / 2.1);
        ctx.arc(
          wrapper.controllers.rotate.x,
          wrapper.controllers.rotate.y,
          wrapper.controllerSize * 0.8,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.closePath();
      }

      // draw wrapper's controllers
      [
        wrapper.controllers.topLeft,
        wrapper.controllers.top,
        wrapper.controllers.topRight,
        wrapper.controllers.right,
        wrapper.controllers.bottomRight,
        wrapper.controllers.bottom,
        wrapper.controllers.bottomLeft,
        wrapper.controllers.left
      ].forEach((controller) => {
        if (controller.invisible !== true) {
          ctx.setFillStyle(wrapper.color);
          ctx.beginPath();
          ctx.arc(
            controller.x,
            controller.y,
            wrapper.controllerSize,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.closePath();

          ctx.setFillStyle('#FFFFFF');
          ctx.beginPath();
          ctx.arc(
            controller.x,
            controller.y,
            wrapper.controllerSize - 1,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.closePath();
        }
      });
    } else {
      // draw wrapper's lock controllers,
      clearContext(ctx);
      ctx.setStrokeStyle(wrapper.color);
      [
        wrapper.controllers.topLeft,
        wrapper.controllers.top,
        wrapper.controllers.topRight,
        wrapper.controllers.right,
        wrapper.controllers.bottomRight,
        wrapper.controllers.bottom,
        wrapper.controllers.bottomLeft,
        wrapper.controllers.left
      ].forEach((controller) => {
        ctx.beginPath();
        ctx.moveTo(
          controller.x - wrapper.controllerSize / 2,
          controller.y - wrapper.controllerSize / 2
        );
        ctx.lineTo(
          controller.x + wrapper.controllerSize / 2,
          controller.y + wrapper.controllerSize / 2
        );
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(
          controller.x + wrapper.controllerSize / 2,
          controller.y - wrapper.controllerSize / 2
        );
        ctx.lineTo(
          controller.x - wrapper.controllerSize / 2,
          controller.y + wrapper.controllerSize / 2
        );
        ctx.stroke();
        ctx.closePath();
      });
    }
  });
}

export function drawAreaWrapper(ctx: IDrawContext, config: HelperConfig) {
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

export function drawElementListWrappers(
  ctx: IDrawContext,
  config: HelperConfig
) {
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
        wrapper.controllers.topLeft.x,
        wrapper.controllers.topLeft.y,
        wrapper.controllers.bottomRight.x - wrapper.controllers.topLeft.x,
        wrapper.controllers.bottomRight.y - wrapper.controllers.topLeft.y
      );

      clearContext(ctx);
      ctx.beginPath();
      ctx.setLineDash(wrapper.lineDash);
      ctx.setLineWidth(wrapper.lineWidth);
      ctx.setStrokeStyle(wrapper.color);
      ctx.moveTo(wrapper.controllers.topLeft.x, wrapper.controllers.topLeft.y);
      ctx.lineTo(
        wrapper.controllers.topRight.x,
        wrapper.controllers.topRight.y
      );
      ctx.lineTo(
        wrapper.controllers.bottomRight.x,
        wrapper.controllers.bottomRight.y
      );
      ctx.lineTo(
        wrapper.controllers.bottomLeft.x,
        wrapper.controllers.bottomLeft.y
      );
      ctx.lineTo(
        wrapper.controllers.topLeft.x,
        wrapper.controllers.topLeft.y - wrapper.lineWidth / 2
      );
      ctx.stroke();
      ctx.closePath();

      if (wrapper.lock === true) {
        // draw wrapper's lock controllers,
        clearContext(ctx);
        // ctx.setFillStyle(wrapper.color);
        ctx.setStrokeStyle(wrapper.color);
        [
          wrapper.controllers.topLeft,
          wrapper.controllers.top,
          wrapper.controllers.topRight,
          wrapper.controllers.right,
          wrapper.controllers.bottomRight,
          wrapper.controllers.bottom,
          wrapper.controllers.bottomLeft,
          wrapper.controllers.left
        ].forEach((controller) => {
          ctx.beginPath();
          ctx.moveTo(
            controller.x - wrapper.controllerSize / 2,
            controller.y - wrapper.controllerSize / 2
          );
          ctx.lineTo(
            controller.x + wrapper.controllerSize / 2,
            controller.y + wrapper.controllerSize / 2
          );
          ctx.stroke();
          ctx.closePath();

          ctx.beginPath();
          ctx.moveTo(
            controller.x + wrapper.controllerSize / 2,
            controller.y - wrapper.controllerSize / 2
          );
          ctx.lineTo(
            controller.x - wrapper.controllerSize / 2,
            controller.y + wrapper.controllerSize / 2
          );
          ctx.stroke();
          ctx.closePath();
        });
      }
    });
  });
}
