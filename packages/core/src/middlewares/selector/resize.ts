import { scalePathCommands } from '@idraw/util';
import type { StrictMaterial, Material } from '@idraw/types';

export const dragAndResizeMaterial = (
  mtrl: Material,
  opts: { x: number; y: number; width: number; height: number }
) => {
  const { x, y, width, height } = opts;

  const prevWidth = mtrl.width;
  const prevHeight = mtrl.height;

  mtrl.x = x;
  mtrl.y = y;
  mtrl.width = width;
  mtrl.height = height;

  if (mtrl.type === 'circle') {
    mtrl.cx = x + width / 2;
    mtrl.cy = y + height / 2;
    mtrl.r = Math.min(width, height) / 2;
  } else if (mtrl.type === 'ellipse') {
    mtrl.cx = x + width / 2;
    mtrl.cy = y + height / 2;
    mtrl.rx = width / 2;
    mtrl.ry = height / 2;
  } else if (mtrl.type === 'path') {
    const scaleW = width / prevWidth;
    const scaleH = height / prevHeight;
    const svgMtrl = mtrl as StrictMaterial<'path'>;
    svgMtrl.commands = scalePathCommands(svgMtrl.commands, scaleW, scaleH);
  }
};
