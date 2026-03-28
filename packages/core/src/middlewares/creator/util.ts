import type { MaterialType, Material, MaterialSize, Point, ViewScaleInfo, ViewCalculator } from '@idraw/types';
import { createId, calcPointFromView, getDefaultMaterialAttributes } from '@idraw/util';

type Options = { start: Point; end: Point; viewScaleInfo: ViewScaleInfo; calculator: ViewCalculator };

function getMaterialSizeByArea(opts: Options) {
  const { start, end, viewScaleInfo, calculator } = opts;
  const startPoint = calcPointFromView(start, { viewScaleInfo });
  const endPoint = calcPointFromView(end, { viewScaleInfo });
  const size: MaterialSize = {
    x: calculator.toGridNum(Math.min(startPoint.x, endPoint.x)),
    y: calculator.toGridNum(Math.min(startPoint.y, endPoint.y)),
    width: calculator.toGridNum(Math.abs(endPoint.x - startPoint.x)),
    height: calculator.toGridNum(Math.abs(endPoint.y - startPoint.y)),
  };
  return size;
}

export function createMaterialByArea(type: Exclude<MaterialType, 'path' | 'foreignObject' | 'svgCode'>, opts: Options) {
  const { fill, text, href } = getDefaultMaterialAttributes();
  const defaultMtrlAttrs: Partial<Material> = { fill };
  if (type === 'circle') {
    defaultMtrlAttrs.r = 1;
  } else if (type === 'ellipse') {
    defaultMtrlAttrs.rx = 1;
    defaultMtrlAttrs.ry = 1;
  } else if (type === 'text') {
    defaultMtrlAttrs.text = text;
    defaultMtrlAttrs.fontSize = 1;
  } else if (type === 'image') {
    defaultMtrlAttrs.href = href;
  } else if (type === 'group') {
    defaultMtrlAttrs.children = [];
  }
  const mtrl: Material = {
    id: createId(),
    type,
    ...defaultMtrlAttrs,
    ...getMaterialSizeByArea(opts),
  };

  return mtrl;
}

export function updateMaterialByArea(mtrl: Material, opts: Options) {
  const size = getMaterialSizeByArea(opts);
  const { type } = mtrl;
  const updatedMtrl: Material = {
    ...mtrl,
    ...size,
  };
  if (type === 'circle') {
    updatedMtrl.r = Math.min(size.width, size.height) / 2;
  } else if (type === 'ellipse') {
    updatedMtrl.rx = size.width / 2;
    updatedMtrl.ry = size.height / 2;
  } else if (type === 'text') {
    updatedMtrl.fontSize = Math.min(size.width, size.height);
  }
  return updatedMtrl;
}
