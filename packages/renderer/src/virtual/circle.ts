import type { StrictMaterial, VirtualRectAttributes, PathCommand, CalcVirtualAttributesOptions } from '@idraw/types';
import { calcVirtualBaseAttributes } from './base';

export function calcVirtualCircleAttributes(
  mtrl: StrictMaterial<'circle'>,
  opts: CalcVirtualAttributesOptions
): VirtualRectAttributes {
  const { dpr } = opts;
  const { width, height } = mtrl;
  let { r } = mtrl;

  // cx = (cx - x) * dpr;
  // cy = (cy - y) * dpr;

  const cx = (width / 2) * dpr;
  const cy = (height / 2) * dpr;

  r = r * dpr;

  // Use four cubic Bezier curves to approximate a circle (one for each 90-degree segment)
  // Control point distance = (4/3)*tan(π/8) * r ≈ 0.55228475 * r
  const c = r * 0.55228475;

  const commands: PathCommand[] = [
    // M - Move to starting point (right side of circle)
    {
      type: 'M',
      params: [cx + r, cy],
    },

    // C - Cubic Bezier curve to top point
    {
      type: 'C',
      params: [cx + r, cy - c, cx + c, cy - r, cx, cy - r],
    },

    // C - Cubic Bezier curve to left point
    {
      type: 'C',
      params: [cx - c, cy - r, cx - r, cy - c, cx - r, cy],
    },

    // C - Cubic Bezier curve to bottom point
    {
      type: 'C',
      params: [cx - r, cy + c, cx - c, cy + r, cx, cy + r],
    },

    // C - Cubic Bezier curve back to starting point
    {
      type: 'C',
      params: [cx + c, cy + r, cx + r, cy + c, cx + r, cy],
    },

    {
      type: 'Z',
      params: [],
    },
  ];

  const attributes: VirtualRectAttributes = {
    ...calcVirtualBaseAttributes(mtrl, opts),
    commands,
  };
  return attributes;
}
