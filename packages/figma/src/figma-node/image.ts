import type { Element, ElementImageDetail } from '@idraw/types';
import { nodeToElementBase, nodeToBaseDetail, getFillPathCommands } from './base';
import { nodeToOperations } from './operations';
import type { FigmaNode, FigmaFillPaint, FigmaFillPaintImage, FigmaParseOptions } from '../types';
import { figmaImageDir } from '../config';
import { mergeNodeOverrideData, uint8ArrayToBase64 } from '../common/node';

async function getFillImageDetail(fillPaints: FigmaFillPaint[], opts: FigmaParseOptions): Promise<ElementImageDetail> {
  const { figmaMap } = opts;
  const detail: ElementImageDetail = {
    src: ''
  };
  for (let i = 0; i < fillPaints.length; i++) {
    if (fillPaints[i].type === 'IMAGE') {
      const fillPaintImage: FigmaFillPaintImage = fillPaints[i] as FigmaFillPaintImage;
      const { image, imageScaleMode, originalImageHeight, originalImageWidth } = fillPaintImage;
      const hashStr = Array.from(image.hash)
        .map((num) => num.toString(16).padStart(2, '0'))
        .join('');
      const imageKey = `${figmaImageDir}${hashStr}`;
      const imageBuffer = figmaMap[imageKey];
      if (imageBuffer) {
        const base64 = await uint8ArrayToBase64(imageBuffer as Uint8Array, { type: 'image/png' });
        detail.src = base64;
      }
      if (imageScaleMode === 'FILL') {
        detail.scaleMode = 'fill';
      } else if (imageScaleMode === 'FIT') {
        detail.scaleMode = 'fit';
      } else if (imageScaleMode === 'TILE') {
        detail.scaleMode = 'tile';
      }
      if (originalImageHeight >= 0) {
        detail.originH = originalImageHeight;
      }
      if (originalImageWidth >= 0) {
        detail.originW = originalImageWidth;
      }
    }
  }
  return detail;
}

export async function nodeToImageElement(figmaNode: FigmaNode, opts: FigmaParseOptions): Promise<Element<'image'>> {
  const overrideData = mergeNodeOverrideData(figmaNode, opts);
  const node = { ...figmaNode, ...overrideData };

  const { fillPaints, fillGeometry } = node;
  const elemBase = nodeToElementBase(node);
  const elem: Element<'image'> = {
    ...elemBase,
    type: 'image',
    detail: {
      src: ''
    }
  };
  const operations: Required<Element<'rect'>>['operations'] = nodeToOperations(node);
  let detail: Element<'image'>['detail'] = nodeToBaseDetail(node) as Element<'image'>['detail'];
  let imageDetail = await getFillImageDetail(fillPaints, opts);
  detail = {
    ...detail,
    ...imageDetail
  };

  if (Array.isArray(fillGeometry) && fillGeometry.length > 0) {
    const commands = getFillPathCommands(node);
    detail.clipPath = {
      commands,
      originX: 0,
      originY: 0,
      originW: elemBase.w,
      originH: elemBase.h
    };
    detail.clipPathStrokeColor = detail.borderColor;
    if (typeof detail.borderWidth === 'number') {
      detail.clipPathStrokeWidth = detail.borderWidth;
    }
  }

  elem.operations = operations;
  elem.detail = detail as Element<'image'>['detail'];
  return elem;
}
