import { ViewContext2D, Element, ElementType, ElementSize, ViewScaleInfo, ViewSizeInfo, TransformAction } from '@idraw/types';
import { istype, isColorStr, generateSVGPath, rotateElement, is, getDefaultElementDetailConfig, calcViewBoxSize } from '@idraw/util';
import { createColorStyle } from './color';

const defaultElemConfig = getDefaultElementDetailConfig();

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
  const { pattern, renderContent, originElem, calcElemSize, viewScaleInfo, viewSizeInfo } = opts || {};

  drawClipPath(ctx, viewElem, {
    originElem,
    calcElemSize,
    viewScaleInfo,
    viewSizeInfo,
    renderContent: () => {
      if (viewElem?.detail?.opacity !== undefined && viewElem?.detail?.opacity >= 0) {
        ctx.globalAlpha = viewElem.detail.opacity;
      } else {
        ctx.globalAlpha = 1;
      }
      drawBoxBackground(ctx, viewElem, { pattern, viewScaleInfo, viewSizeInfo });
      renderContent?.();
      drawBoxBorder(ctx, viewElem, { viewScaleInfo, viewSizeInfo });
      // TODO
      // drawBoxBackground(ctx, viewElem, { pattern, viewScaleInfo, viewSizeInfo });
      ctx.globalAlpha = 1;
    }
  });
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
  const { pattern, viewScaleInfo, viewSizeInfo } = opts;
  let transform: TransformAction[] = [];
  let { borderRadius, borderWidth } = viewElem.detail;
  if (typeof borderWidth !== 'number') {
    // TODO: If borderWidth is an array, borderRadius will not take effect and will become 0.
    borderRadius = 0;
  }
  if (viewElem.detail.background || pattern) {
    const { x, y, w, h, radiusList } = calcViewBoxSize(viewElem, {
      viewScaleInfo,
      viewSizeInfo
    });

    // r = Math.min(r, w / 2, h / 2);
    // if (w < r * 2 || h < r * 2) {
    //   r = 0;
    // }
    ctx.beginPath();
    ctx.moveTo(x + radiusList[0], y);
    ctx.arcTo(x + w, y, x + w, y + h, radiusList[1]);
    ctx.arcTo(x + w, y + h, x, y + h, radiusList[2]);
    ctx.arcTo(x, y + h, x, y, radiusList[3]);
    ctx.arcTo(x, y, x + w, y, radiusList[0]);
    ctx.closePath();
    if (typeof pattern === 'string') {
      ctx.fillStyle = pattern;
    } else if (['CanvasPattern'].includes(istype.type(pattern))) {
      ctx.fillStyle = pattern as CanvasPattern;
    } else if (typeof viewElem.detail.background === 'string') {
      ctx.fillStyle = viewElem.detail.background;
    } else if (viewElem.detail.background?.type === 'linear-gradient') {
      const colorStyle = createColorStyle(ctx, viewElem.detail.background, {
        viewElementSize: { x, y, w, h },
        viewScaleInfo,
        opacity: ctx.globalAlpha
      });
      ctx.fillStyle = colorStyle;
    } else if (viewElem.detail.background?.type === 'radial-gradient') {
      const colorStyle = createColorStyle(ctx, viewElem.detail.background, {
        viewElementSize: { x, y, w, h },
        viewScaleInfo,
        opacity: ctx.globalAlpha
      });
      ctx.fillStyle = colorStyle;
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
  if (viewElem.detail.borderWidth === 0) {
    return;
  }
  if (!isColorStr(viewElem.detail.borderColor)) {
    return;
  }
  if (viewElem?.detail?.opacity !== undefined && viewElem?.detail?.opacity >= 0) {
    ctx.globalAlpha = viewElem.detail.opacity;
  } else {
    ctx.globalAlpha = 1;
  }
  const { viewScaleInfo } = opts;
  const { scale } = viewScaleInfo;
  let borderColor = defaultElemConfig.borderColor;
  if (isColorStr(viewElem.detail.borderColor) === true) {
    borderColor = viewElem.detail.borderColor as string;
  }
  const { borderWidth, borderRadius, borderDash, boxSizing = defaultElemConfig.boxSizing } = viewElem.detail;
  let bw: number = 0;
  if (typeof borderWidth === 'number') {
    bw = borderWidth || 1;
  }
  bw = bw * scale;
  let radiusList: [number, number, number, number] = [0, 0, 0, 0];
  if (typeof borderRadius === 'number') {
    const br = borderRadius * scale;
    radiusList = [br, br, br, br];
  } else if (Array.isArray(borderRadius) && borderRadius?.length === 4) {
    radiusList = [borderRadius[0] * scale, borderRadius[1] * scale, borderRadius[2] * scale, borderRadius[3] * scale];
  }
  ctx.strokeStyle = borderColor;
  let viewBorderDash: number[] = [];
  if (Array.isArray(borderDash) && borderDash.length > 0) {
    viewBorderDash = borderDash.map((num) => Math.ceil(num * scale));
  }

  let borderTop = 0;
  let borderRight = 0;
  let borderBottom = 0;
  let borderLeft = 0;
  if (Array.isArray(borderWidth)) {
    borderTop = (borderWidth[0] || 0) * scale;
    borderRight = (borderWidth[1] || 0) * scale;
    borderBottom = (borderWidth[2] || 0) * scale;
    borderLeft = (borderWidth[3] || 0) * scale;
  }

  if (borderLeft || borderRight || borderTop || borderBottom) {
    ctx.lineCap = 'butt';
    let { x, y, w, h } = viewElem;
    if (boxSizing === 'border-box') {
      x = x + borderLeft / 2;
      y = y + borderTop / 2;
      w = w - borderLeft / 2 - borderRight / 2;
      h = h - borderTop / 2 - borderBottom / 2;
    } else if (boxSizing === 'content-box') {
      x = x - borderLeft / 2;
      y = y - borderTop / 2;
      w = w + borderLeft / 2 + borderRight / 2;
      h = h + borderTop / 2 + borderBottom / 2;
    } else {
      // center-line
      x = viewElem.x;
      y = viewElem.y;
      w = viewElem.w;
      h = viewElem.h;
    }

    if (borderTop) {
      ctx.beginPath();
      ctx.lineWidth = borderTop;
      ctx.moveTo(x - borderLeft / 2, y);
      ctx.lineTo(x + w + borderRight / 2, y);
      ctx.closePath();
      ctx.stroke();
    }
    if (borderRight) {
      ctx.beginPath();
      ctx.lineWidth = borderRight;
      ctx.moveTo(x + w, y - borderTop / 2);
      ctx.lineTo(x + w, y + h + borderBottom / 2);
      ctx.closePath();
      ctx.stroke();
    }
    if (borderBottom) {
      ctx.beginPath();
      ctx.lineWidth = borderBottom;
      ctx.moveTo(x - borderLeft / 2, y + h);
      ctx.lineTo(x + w + borderRight / 2, y + h);
      ctx.closePath();
      ctx.stroke();
    }
    if (borderLeft) {
      ctx.beginPath();
      ctx.lineWidth = borderLeft;
      ctx.moveTo(x, y - borderTop / 2);
      ctx.lineTo(x, y + h + borderBottom / 2);
      ctx.closePath();
      ctx.stroke();
    }
  } else {
    let { x, y, w, h } = viewElem;

    if (boxSizing === 'border-box') {
      x = viewElem.x + bw / 2;
      y = viewElem.y + bw / 2;
      w = viewElem.w - bw;
      h = viewElem.h - bw;
    } else if (boxSizing === 'content-box') {
      x = viewElem.x - bw / 2;
      y = viewElem.y - bw / 2;
      w = viewElem.w + bw;
      h = viewElem.h + bw;
    } else {
      // center-line
      x = viewElem.x;
      y = viewElem.y;
      w = viewElem.w;
      h = viewElem.h;
    }

    // r = Math.min(r, w / 2, h / 2);
    // if (r < w / 2 && r < h / 2) {
    //   r = r + bw / 2;
    // }
    if (viewBorderDash.length > 0) {
      ctx.lineCap = 'butt';
    } else {
      ctx.lineCap = 'square';
    }
    ctx.setLineDash(viewBorderDash);
    ctx.lineWidth = bw;
    ctx.beginPath();
    ctx.moveTo(x + radiusList[0], y);
    ctx.arcTo(x + w, y, x + w, y + h, radiusList[1]);
    ctx.arcTo(x + w, y + h, x, y + h, radiusList[2]);
    ctx.arcTo(x, y + h, x, y, radiusList[3]);
    ctx.arcTo(x, y, x + w, y, radiusList[0]);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.setLineDash([]);
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
    ctx.shadowColor = shadowColor || defaultElemConfig.shadowColor;
    ctx.shadowOffsetX = (shadowOffsetX || 0) * viewScaleInfo.scale;
    ctx.shadowOffsetY = (shadowOffsetY || 0) * viewScaleInfo.scale;
    ctx.shadowBlur = (shadowBlur || 0) * viewScaleInfo.scale;
    renderContent();
    ctx.restore();
  } else {
    renderContent();
  }
}
