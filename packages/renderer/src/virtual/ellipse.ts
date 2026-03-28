import type { StrictMaterial, VirtualRectAttributes, PathCommand, CalcVirtualAttributesOptions } from '@idraw/types';
import { calcVirtualBaseAttributes } from './base';

export function calcVirtualEllipseAttributes(
  mtrl: StrictMaterial<'ellipse'>,
  opts: CalcVirtualAttributesOptions
): VirtualRectAttributes {
  const { dpr } = opts;
  const { width, height } = mtrl;
  let { rx, ry } = mtrl;

  // x = x * dpr;
  // y = y * dpr;
  // cx = cx * dpr;
  // cy = cy * dpr;
  const cx = (width / 2) * dpr;
  const cy = (height / 2) * dpr;
  rx = rx * dpr;
  ry = ry * dpr;
  // height = height * dpr;
  // width = width * dpr;

  // Magic number for Bezier curve approximation of ellipses
  // This is derived from the circle approximation constant adjusted for ellipse
  const kx = 0.55228475 * rx;
  const ky = 0.55228475 * ry;

  const commands: PathCommand[] = [
    // M - Move to right point
    {
      type: 'M',
      params: [cx + rx, cy],
    },

    // C - Cubic Bezier curve to top point
    {
      type: 'C',
      params: [cx + rx, cy - ky, cx + kx, cy - ry, cx, cy - ry],
    },

    // C - Cubic Bezier curve to left point
    {
      type: 'C',
      params: [cx - kx, cy - ry, cx - rx, cy - ky, cx - rx, cy],
    },

    // C - Cubic Bezier curve to bottom point
    {
      type: 'C',
      params: [cx - rx, cy + ky, cx - kx, cy + ry, cx, cy + ry],
    },

    // C - Cubic Bezier curve back to starting point
    {
      type: 'C',
      params: [cx + kx, cy + ry, cx + rx, cy + ky, cx + rx, cy],
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
