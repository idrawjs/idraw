import { is, calcDistance } from '@idraw/util';
import { LinearGradientColor, RadialGradientColor } from '@idraw/types';
import type { FigmaColor, FigmaPaint, FigmaFillPaintSolid, FigmaFillPaintGradientLinear, FigmaFillPaintGradientRadial } from '../types';
import { parseLinearGradientParamsFromTransform, parseRadialOrDiamondGradientParamsFromTransform } from './gradient';

function numToHex(num: number): string {
  const unit = 255;
  const hexNum = Math.min(Math.max(Math.round(num * unit), 0), unit);
  const hex = hexNum.toString(16).toUpperCase().padStart(2, '0');
  return hex;
}

export function figmaColorToHex(color: FigmaColor, opts?: { opacity?: number }): string {
  const { r, g, b, a } = color;
  let opacity = 1;
  if (is.number(opts?.opacity)) {
    opacity = opts?.opacity as number;
  }
  const list: string[] = ['#', numToHex(r), numToHex(g), numToHex(b)];
  const alpha = a * opacity;
  if (alpha < 1) {
    list.push(numToHex(alpha));
  }
  return list.join('');
}

export function figmaPaintsToHexColor(paints: FigmaPaint[]): string {
  if (Array.isArray(paints) && paints.length > 0) {
    for (let i = 0; i < paints.length; i++) {
      const { color, opacity, visible, type } = paints[i] as FigmaFillPaintSolid;
      if (visible === true && type === 'SOLID') {
        return figmaColorToHex(color, { opacity });
      }
    }
  }
  return 'transparent';
}

export function figmaPaintToLinearGradient(paint: FigmaFillPaintGradientLinear, opts: { w: number; h: number }): LinearGradientColor | string {
  const { type, transform, stops } = paint;
  const { w, h } = opts;
  if (type === 'GRADIENT_LINEAR') {
    const { start, end } = parseLinearGradientParamsFromTransform(w, h, transform);
    const linearGradient: LinearGradientColor = {
      type: 'linear-gradient',
      start,
      end,
      stops: stops.map((stop) => {
        const { position, color } = stop;
        return {
          color: figmaColorToHex(color),
          offset: position
        };
      })
    };
    return linearGradient;
  }
  return 'transparent';
}

export function figmaPaintToRadialGradient(paint: FigmaFillPaintGradientRadial, opts: { w: number; h: number }): RadialGradientColor | string {
  const { type, transform, stops } = paint;
  const { w, h } = opts;
  if (type === 'GRADIENT_RADIAL') {
    const { rotation, center, radius } = parseRadialOrDiamondGradientParamsFromTransform(w, h, transform);
    const centerPoint = {
      x: center[0],
      y: center[1]
    };
    const radiusPoint = {
      x: radius[0],
      y: radius[1]
    };
    const r = calcDistance(centerPoint, radiusPoint);
    const radialGradient: RadialGradientColor = {
      type: 'radial-gradient',
      angle: rotation,
      inner: {
        x: centerPoint.x,
        y: centerPoint.y,
        radius: r
      },
      outer: {
        x: radiusPoint.x,
        y: radiusPoint.y,
        radius: r
      },
      stops: stops.map((stop) => {
        const { position, color } = stop;
        return {
          color: figmaColorToHex(color),
          offset: position
        };
      })
    };
    return radialGradient;
  }
  return 'transparent';
}

export function figmaPaintsToColor(paints: FigmaPaint[], opts: { w: number; h: number }): string | LinearGradientColor | RadialGradientColor {
  if (Array.isArray(paints) && paints.length > 0) {
    for (let i = 0; i < paints.length; i++) {
      const { visible, type } = paints[i];

      if (visible === true) {
        if (type === 'SOLID') {
          const { color, opacity } = paints[i] as FigmaFillPaintSolid;
          return figmaColorToHex(color, { opacity });
        }
        if (type === 'GRADIENT_LINEAR') {
          return figmaPaintToLinearGradient(paints[i] as FigmaFillPaintGradientLinear, opts);
        }
        if (type === 'GRADIENT_RADIAL') {
          return figmaPaintToRadialGradient(paints[i] as FigmaFillPaintGradientRadial, opts);
        }
      }
    }
  }
  return 'transparent';
}
