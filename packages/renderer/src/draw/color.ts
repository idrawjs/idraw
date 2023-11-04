import type { ViewContext2D, ViewScaleInfo, ElementSize, LinearGradientColor, RadialGradientColor } from '@idraw/types';
import { mergeHexColorAlpha } from '@idraw/util';

export function createColorStyle(
  ctx: ViewContext2D,
  color: string | LinearGradientColor | RadialGradientColor | undefined,
  opts: {
    viewElementSize: ElementSize;
    viewScaleInfo: ViewScaleInfo;
    opacity: number;
  }
): string | CanvasPattern | CanvasGradient {
  if (typeof color === 'string') {
    return color;
  }
  const { viewElementSize, viewScaleInfo, opacity = 1 } = opts;
  const { x, y } = viewElementSize;
  const { scale } = viewScaleInfo;
  if (color?.type === 'linear-gradient') {
    const { start, end, stops } = color;
    const viewStart = {
      x: x + start.x * scale,
      y: y + start.y * scale
    };
    const viewEnd = {
      x: x + end.x * scale,
      y: y + end.y * scale
    };

    const linearGradient = ctx.createLinearGradient(viewStart.x, viewStart.y, viewEnd.x, viewEnd.y);
    stops.forEach((stop) => {
      linearGradient.addColorStop(stop.offset, mergeHexColorAlpha(stop.color, opacity));
    });
    return linearGradient;
  }

  if (color?.type === 'radial-gradient') {
    const { inner, outer, stops } = color;
    const viewInner = {
      x: x + inner.x * scale,
      y: y + inner.y * scale,
      radius: inner.radius * scale
    };
    const viewOuter = {
      x: x + outer.x * scale,
      y: y + outer.y * scale,
      radius: outer.radius * scale
    };
    const radialGradient = ctx.createRadialGradient(viewInner.x, viewInner.y, viewInner.radius, viewOuter.x, viewOuter.y, viewOuter.radius);
    stops.forEach((stop) => {
      radialGradient.addColorStop(stop.offset, mergeHexColorAlpha(stop.color, opacity));
    });
    return radialGradient;
  }

  return '#000000';
}
