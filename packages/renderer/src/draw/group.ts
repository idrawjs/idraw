import type { Element, ElementType, ElementSize, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement, calcViewBoxSize } from '@idraw/util';
import { drawCircle } from './circle';
import { drawRect } from './rect';
import { drawImage } from './image';
import { drawText } from './text';
import { drawSVG } from './svg';
import { drawHTML } from './html';
import { drawBox, drawBoxShadow, getOpacity } from './box';
import { drawPath } from './path';

export function drawElement(ctx: ViewContext2D, elem: Element<ElementType>, opts: RendererDrawElementOptions) {
  if (elem?.operations?.invisible === true) {
    return;
  }
  const { w, h } = elem;
  const { scale } = opts.viewScaleInfo;
  if ((scale < 1 && (w * scale < 1 || h * scale < 1)) || opts.parentOpacity === 0) {
    return;
  }

  try {
    switch (elem.type) {
      case 'rect': {
        drawRect(ctx, elem as Element<'rect'>, opts);
        break;
      }
      case 'circle': {
        drawCircle(ctx, elem as Element<'circle'>, opts);
        break;
      }
      case 'text': {
        drawText(ctx, elem as Element<'text'>, opts);
        break;
      }
      case 'image': {
        drawImage(ctx, elem as Element<'image'>, opts);
        break;
      }
      case 'svg': {
        drawSVG(ctx, elem as Element<'svg'>, opts);
        break;
      }
      case 'html': {
        drawHTML(ctx, elem as Element<'html'>, opts);
        break;
      }
      case 'path': {
        drawPath(ctx, elem as Element<'path'>, opts);
        break;
      }
      case 'group': {
        const assets = {
          ...(opts.elementAssets || {}),
          ...((elem as Element<'group'>).detail.assets || {})
        };
        drawGroup(ctx, elem as Element<'group'>, {
          ...opts,
          elementAssets: assets
        });
        break;
      }
      default: {
        break;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export function drawGroup(ctx: ViewContext2D, elem: Element<'group'>, opts: RendererDrawElementOptions) {
  const { calculator, viewScaleInfo, viewSizeInfo, parentOpacity } = opts;
  const { x, y, w, h, angle } = calculator?.elementSize({ x: elem.x, y: elem.y, w: elem.w, h: elem.h, angle: elem.angle }, viewScaleInfo, viewSizeInfo) || elem;
  const viewElem = { ...elem, ...{ x, y, w, h, angle } };
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    ctx.globalAlpha = getOpacity(elem) * parentOpacity;
    drawBoxShadow(ctx, viewElem, {
      viewScaleInfo,
      viewSizeInfo,
      renderContent: () => {
        drawBox(ctx, viewElem, {
          originElem: elem,
          calcElemSize: { x, y, w, h, angle },
          viewScaleInfo,
          viewSizeInfo,
          parentOpacity,
          renderContent: () => {
            const { x, y, w, h, radiusList } = calcViewBoxSize(viewElem, {
              viewScaleInfo,
              viewSizeInfo
            });
            if (elem.detail.overflow === 'hidden') {
              ctx.save();

              ctx.fillStyle = 'transparent';
              ctx.beginPath();
              ctx.moveTo(x + radiusList[0], y);
              ctx.arcTo(x + w, y, x + w, y + h, radiusList[1]);
              ctx.arcTo(x + w, y + h, x, y + h, radiusList[2]);
              ctx.arcTo(x, y + h, x, y, radiusList[3]);
              ctx.arcTo(x, y, x + w, y, radiusList[0]);
              ctx.closePath();
              ctx.fill();
              ctx.clip();
            }

            if (Array.isArray(elem.detail.children)) {
              const { parentElementSize: parentSize } = opts;
              const newParentSize: ElementSize = {
                x: parentSize.x + elem.x,
                y: parentSize.y + elem.y,
                w: elem.w || parentSize.w,
                h: elem.h || parentSize.h,
                angle: elem.angle
              };
              const { calculator } = opts;

              for (let i = 0; i < elem.detail.children.length; i++) {
                let child = elem.detail.children[i];
                child = {
                  ...child,
                  ...{
                    x: newParentSize.x + child.x,
                    y: newParentSize.y + child.y
                  }
                };
                if (opts.forceDrawAll !== true) {
                  if (!calculator?.isElementInView(child, opts.viewScaleInfo, opts.viewSizeInfo)) {
                    continue;
                  }
                }

                try {
                  drawElement(ctx, child, { ...opts, ...{ parentOpacity: parentOpacity * getOpacity(elem) } });
                } catch (err) {
                  console.error(err);
                }
              }
            }

            if (elem.detail.overflow === 'hidden') {
              ctx.restore();
            }
          }
        });
      }
    });
    ctx.globalAlpha = parentOpacity;
  });
}
