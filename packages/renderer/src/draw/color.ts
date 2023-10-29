import type { ViewContext2D, ViewScaleInfo, ElementSize, LinearGradientColor, RadialGradientColor } from '@idraw/types';

export function createColorStyle(
  ctx: ViewContext2D,
  color: string | LinearGradientColor | RadialGradientColor | undefined,
  opts: {
    viewElementSize: ElementSize;
    viewScaleInfo: ViewScaleInfo;
  }
): string | CanvasPattern | CanvasGradient {
  if (typeof color === 'string') {
    return color;
  }
  const { viewElementSize, viewScaleInfo } = opts;
  const { x, y } = viewElementSize;
  const { scale } = viewScaleInfo;
  if (color?.type === 'linearGradient') {
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
      linearGradient.addColorStop(stop.offset, stop.color);
    });
    return linearGradient;
  }

  if (color?.type === 'radialGradient') {
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
      radialGradient.addColorStop(stop.offset, stop.color);
    });
    return radialGradient;
  }

  return '#000000';
}
