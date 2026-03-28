import type { StrictMaterial, VirtualRectAttributes, PathCommand, CalcVirtualAttributesOptions } from '@idraw/types';
import { createId } from '@idraw/util';
import { calcVirtualBaseAttributes } from './base';

export function calcVirtualRectAttributes(
  mtrl: StrictMaterial<'rect' | 'text'>,
  opts: CalcVirtualAttributesOptions
): VirtualRectAttributes {
  const { dpr } = opts;
  let {
    // x,
    // y,
    width,
    height,
    rx = 0,
    ry = 0,
  } = mtrl as StrictMaterial<'rect'>;
  const { cornerRadius } = mtrl;
  // x = x * dpr;
  // y = y * dpr;
  const x = 0;
  const y = 0;
  height = height * dpr;
  width = width * dpr;

  const commands: PathCommand[] = [];

  //   tlRX ----- trRX
  // tlRY           trRY
  //  |             |
  // blRY           brRY
  //   blRX ----- brRX

  let tlRX = 0;
  let trRX = 0;
  let brRX = 0;
  let blRX = 0;
  let tlRY = 0;
  let trRY = 0;
  let brRY = 0;
  let blRY = 0;

  if (typeof rx === 'number' && typeof ry === 'number') {
    rx = rx * dpr;
    ry = ry * dpr;
    tlRX = rx;
    trRX = rx;
    brRX = rx;
    blRX = rx;
    tlRY = ry;
    trRY = ry;
    brRY = ry;
    blRY = ry;
  } else if (Array.isArray(cornerRadius) && cornerRadius.length === 4) {
    const crs = cornerRadius.map((r) => r * dpr);
    tlRX = crs[0] || 0;
    trRX = crs[1] || 0;
    brRX = crs[2] || 0;
    blRX = crs[3] || 0;
    tlRY = crs[0] || 0;
    trRY = crs[1] || 0;
    brRY = crs[2] || 0;
    blRY = crs[3] || 0;
  } else if (typeof cornerRadius === 'number') {
    const cr = cornerRadius * dpr;
    tlRX = cr;
    trRX = cr;
    brRX = cr;
    blRX = cr;
    tlRY = cr;
    trRY = cr;
    brRY = cr;
    blRY = cr;
  }

  // if (Array.isArray(cornerRadius)) {
  const x0 = x;
  const y0 = y;
  const x1 = x + width;
  const y1 = y + height;

  // M x+rx, y
  commands.push({
    id: createId(),
    type: 'M',
    params: [x + tlRX, y],
  });

  // Top edge and top right elliptical corner
  if (trRX > 0 || trRY > 0) {
    commands.push({
      id: createId(),
      type: 'L',
      params: [x1 - trRX, y0],
    });
    commands.push({
      id: createId(),
      type: 'A',
      params: [trRX, trRY, 0, 0, 1, x1, y0 + trRY],
    });
  } else {
    commands.push({
      id: createId(),
      type: 'L',
      params: [x1, y0],
    });
  }

  // Right edge and bottom right elliptical corner
  if (brRX > 0 || brRY > 0) {
    commands.push({
      id: createId(),
      type: 'L',
      params: [x1, y1 - brRY],
    });
    commands.push({
      id: createId(),
      type: 'A',
      params: [brRX, brRY, 0, 0, 1, x1 - brRX, y1],
    });
  } else {
    commands.push({
      id: createId(),
      type: 'L',
      params: [x1, y1],
    });
  }

  // Bottom edge and bottom left elliptical corner
  if (blRX > 0 || blRY > 0) {
    commands.push({
      id: createId(),
      type: 'L',
      params: [x0 + blRX, y1],
    });
    commands.push({
      id: createId(),
      type: 'A',
      params: [blRX, blRY, 0, 0, 1, x0, y1 - blRY],
    });
  } else {
    commands.push({
      id: createId(),
      type: 'L',
      params: [x0, y1],
    });
  }

  // Left edge and top left elliptical corner
  if (tlRX > 0 || tlRY > 0) {
    commands.push({
      id: createId(),
      type: 'L',
      params: [x0, y0 + tlRY],
    });
    commands.push({
      id: createId(),
      type: 'A',
      params: [tlRX, tlRY, 0, 0, 1, x0 + tlRX, y0],
    });
  } else {
    commands.push({
      id: createId(),
      type: 'L',
      params: [x0, y0],
    });
  }

  commands.push({
    id: createId(),
    type: 'Z',
    params: [],
  });

  const attributes: VirtualRectAttributes = {
    ...calcVirtualBaseAttributes(mtrl, opts),
    commands,
  };
  return attributes;
}
