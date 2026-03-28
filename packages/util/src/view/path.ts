import { StrictMaterial } from '@idraw/types';
import { calcPathCommondsBoundingBox } from '../tool/path-to-box';
import { shiftPathCommands } from '../tool/path';

export function refinePathMaterial(mtrl: StrictMaterial<'path'>): StrictMaterial<'path'> {
  // eslint-disable-next-line prefer-const
  let { x, y, width, height, ...attributes } = mtrl;
  const { commands } = attributes;
  const boundingBox = calcPathCommondsBoundingBox(commands);
  const { minX, minY, maxX, maxY } = boundingBox;
  x = x + minX;
  y = y + minY;
  width = Math.abs(maxX - minX);
  height = Math.abs(maxY - minY);
  if (minX !== 0 || minY !== 0) {
    attributes.commands = shiftPathCommands(commands, 0 - minX, 0 - minY);
  }

  return {
    ...mtrl,
    x,
    y,
    width,
    height,
    ...attributes,
  };
}
