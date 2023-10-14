import { ViewContext2D, Element, ElementType, ElementSize, ViewScaleInfo, ViewSizeInfo, TransformAction } from '@idraw/types';
import { istype, isColorStr, generateSVGPath, rotateElement, is } from '@idraw/util';

export function drawBox(
  ctx: ViewContext2D,
  viewElem: Element<ElementType>,
  opts: {
    originElem: Element<ElementType>;
    calcElemSize: ElementSize;
    pattern?: string | CanvasPattern | null;
    renderContent: Function;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
  }
): void {
  if (viewElem?.detail?.opacity !== undefined && viewElem?.detail?.opacity > 0) {
    ctx.globalAlpha = viewElem.detail.opacity;
  } else {
    ctx.globalAlpha = 1;
  }
  const { pattern, renderContent, originElem, calcElemSize, viewScaleInfo, viewSizeInfo } = opts || {};

  drawClipPath(ctx, viewElem, {
    originElem,
    calcElemSize,
    viewScaleInfo,
    viewSizeInfo,
    renderContent: () => {
      drawBoxBorder(ctx, viewElem, { viewScaleInfo, viewSizeInfo });
      drawBoxBackground(ctx, viewElem, { pattern, viewScaleInfo, viewSizeInfo });
      renderContent?.();
    }
  });
  ctx.globalAlpha = 1;
}

function drawClipPath(
  ctx: ViewContext2D,
  viewElem: Element<ElementType>,
  opts: {
    originElem?: Element<ElementType>;
    calcElemSize?: ElementSize;
    renderContent: Function;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
  }
) {
  const { renderContent, originElem, calcElemSize, viewScaleInfo, viewSizeInfo } = opts;
  const totalScale = viewScaleInfo.scale * viewSizeInfo.devicePixelRatio;
  const { clipPath } = originElem?.detail || {};
  if (clipPath && calcElemSize && clipPath.commands) {
    const { x, y, w, h } = calcElemSize;
    const { originW, originH, originX, originY } = clipPath;
    const scaleW = w / originW;
    const scaleH = h / originH;
    const viewOriginX = originX * scaleW;
    const viewOriginY = originY * scaleH;
    let internalX = x - viewOriginX;
    let internalY = y - viewOriginY;

    ctx.save();
    ctx.translate(internalX as number, internalY as number);
    ctx.scale(totalScale * scaleW, totalScale * scaleH);
    const pathStr = generateSVGPath(clipPath.commands || []);
    const path2d = new Path2D(pathStr);
    // ctx.fillStyle = clipPath.fill || '#FFFFFF';
    ctx.clip(path2d);
    ctx.translate(0 - (internalX as number), 0 - (internalY as number));
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    rotateElement(ctx, { ...viewElem }, () => {
      renderContent?.();
    });

    ctx.restore();
  } else {
    renderContent?.();
  }
}

function drawBoxBackground(
  ctx: ViewContext2D,
  viewElem: Element<ElementType>,
  opts: { pattern?: string | CanvasPattern | null; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): void {
  const { pattern, viewScaleInfo } = opts;
  let transform: TransformAction[] = [];
  if (viewElem.detail.background || pattern) {
    const { x, y, w, h } = viewElem;
    let r: number = (viewElem.detail.borderRadius || 0) * viewScaleInfo.scale;
    r = Math.min(r, w / 2, h / 2);
    if (w < r * 2 || h < r * 2) {
      r = 0;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (typeof pattern === 'string') {
      ctx.fillStyle = pattern;
    } else if (['CanvasPattern'].includes(istype.type(pattern))) {
      ctx.fillStyle = pattern as CanvasPattern;
    } else if (typeof viewElem.detail.background === 'string') {
      ctx.fillStyle = viewElem.detail.background;
    } else if (viewElem.detail.background?.type === 'linearGradient') {
      const { start, end, stops } = viewElem.detail.background;
      const viewStart = {
        x: start.x + x,
        y: start.y + y
      };
      const viewEnd = {
        x: end.x + x,
        y: end.y + y
      };
      const linearGradient = ctx.createLinearGradient(viewStart.x, viewStart.y, viewEnd.x, viewEnd.y);
      stops.forEach((stop) => {
        linearGradient.addColorStop(stop.offset, stop.color);
      });
      ctx.fillStyle = linearGradient;
    } else if (viewElem.detail.background?.type === 'radialGradient') {
      const { inner, outer, stops } = viewElem.detail.background;
      transform = viewElem.detail.background.transform || [];
      const viewInner = {
        x: inner.x,
        y: inner.y,
        radius: inner.radius * viewScaleInfo.scale
      };
      const viewOuter = {
        x: outer.x,
        y: outer.y,
        radius: outer.radius * viewScaleInfo.scale
      };
      const radialGradient = ctx.createRadialGradient(viewInner.x, viewInner.y, viewInner.radius, viewOuter.x, viewOuter.y, viewOuter.radius);
      stops.forEach((stop) => {
        radialGradient.addColorStop(stop.offset, stop.color);
      });
      ctx.fillStyle = radialGradient;
      if (transform && transform.length > 0) {
        for (let i = 0; i < transform?.length; i++) {
          const action = transform[i];
          if (action.method === 'translate') {
            ctx.translate(action.args[0] + x, action.args[1] + y);
          } else if (action.method === 'rotate') {
            ctx.rotate(...action.args);
          } else if (action.method === 'scale') {
            ctx.scale(...action.args);
          }
        }
      }
    }
    ctx.fill();

    if (transform && transform.length > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // for (let i = transform?.length - 1; i > 0; i--) {
      //   const action = transform[i];
      //   if (action.method === 'translate') {
      //     const args = action.args.map((num) => -num);
      //     ctx.translate(...(args as [number, number]));
      //   } else if (action.method === 'rotate') {
      //     const args = action.args.map((num) => -num);
      //     // ctx.rotate(...(args as [number]));
      //   } else if (action.method === 'scale') {
      //     ctx.setTransform(1, 0, 0, 1, 0, 0);
      //   }
      // }
    }
  }
}

function drawBoxBorder(ctx: ViewContext2D, viewElem: Element<ElementType>, opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): void {
  if (!isColorStr(viewElem.detail.borderColor)) {
    return;
  }
  const { viewScaleInfo } = opts;
  let borderColor = '#000000';
  if (isColorStr(viewElem.detail.borderColor) === true) {
    borderColor = viewElem.detail.borderColor as string;
  }
  const { borderWidth, borderRadius, borderDash } = viewElem.detail;
  let bw: number = 0;
  if (typeof borderWidth === 'number') {
    bw = borderWidth || 1;
  }
  bw = bw * viewScaleInfo.scale;
  let r: number = borderRadius || 0;
  ctx.strokeStyle = borderColor;
  ctx.setLineDash(borderDash || []);

  let borderTop = 0;
  let borderRight = 0;
  let borderBottom = 0;
  let borderLeft = 0;
  if (Array.isArray(borderWidth)) {
    borderTop = borderWidth[0] || 0;
    borderRight = borderWidth[1] || 0;
    borderBottom = borderWidth[2] || 0;
    borderLeft = borderWidth[3] || 0;
  }
  if (borderLeft || borderRight || borderTop || borderBottom) {
    const { x, y, w, h } = viewElem;
    if (borderLeft) {
      ctx.beginPath();
      ctx.lineWidth = borderLeft * viewScaleInfo.scale;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.stroke();
    }
    if (borderRight) {
      ctx.beginPath();
      ctx.lineWidth = borderRight * viewScaleInfo.scale;
      ctx.moveTo(x + w, y);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.stroke();
    }
    if (borderTop) {
      ctx.beginPath();
      ctx.lineWidth = borderTop * viewScaleInfo.scale;
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.closePath();
      ctx.stroke();
    }
    if (borderBottom) {
      ctx.beginPath();
      ctx.lineWidth = borderBottom * viewScaleInfo.scale;
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.stroke();
    }
  } else {
    let { x, y, w, h } = viewElem;
    const { boxSizing } = viewElem.detail;

    if (boxSizing === 'border-box') {
      x = viewElem.x;
      y = viewElem.y;
      w = viewElem.w;
      h = viewElem.h;
    } else {
      x = viewElem.x - bw;
      y = viewElem.y - bw;
      w = viewElem.w + bw * 2;
      h = viewElem.h + bw * 2;
    }

    r = Math.min(r, w / 2, h / 2);
    if (r < w / 2 && r < h / 2) {
      r = r + bw / 2;
    }
    ctx.beginPath();
    ctx.lineWidth = bw;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.stroke();
  }
}

export function drawBoxShadow(
  ctx: ViewContext2D,
  viewElem: Element<ElementType>,
  opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo; renderContent: Function }
): void {
  const { detail } = viewElem;
  const { viewScaleInfo, renderContent } = opts;
  const { shadowColor, shadowOffsetX, shadowOffsetY, shadowBlur } = detail;
  if (is.number(shadowBlur)) {
    ctx.save();
    ctx.shadowColor = shadowColor || '#000000';
    ctx.shadowOffsetX = (shadowOffsetX || 0) * viewScaleInfo.scale;
    ctx.shadowOffsetY = (shadowOffsetY || 0) * viewScaleInfo.scale;
    ctx.shadowBlur = (shadowBlur || 0) * viewScaleInfo.scale;
    renderContent();
    ctx.restore();
  } else {
    renderContent();
  }
}
