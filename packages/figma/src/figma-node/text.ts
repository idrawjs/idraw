import type { Element } from '@idraw/types';
import { nodeToElementBase } from './base';
import { figmaPaintsToHexColor } from './color';
import { nodeToOperations } from './operations';
import type { FigmaNode, FigmaParseOptions } from '../types';
import { mergeNodeOverrideData } from '../common/node';

const defaultFontWeight = 400;

export function textNodeToTextElement(figmaNode: FigmaNode<'TEXT'>, opts: FigmaParseOptions<'TEXT'>): Element<'text'> {
  const overrideData = mergeNodeOverrideData<'TEXT'>(figmaNode, opts);
  const node = { ...figmaNode, ...overrideData };
  const { textData, fontSize, fillPaints, fontName, textAlignHorizontal, textAlignVertical, textCase, lineHeight } = node;
  const { fontMetaData } = textData;
  const elemBase = nodeToElementBase(node as FigmaNode);

  const elem: Element<'text'> = {
    ...elemBase,
    type: 'text',
    detail: {
      text: textData.characters,
      fontFamily: fontName.family,
      // fontFamily: 'arial, sans-serif',
      fontSize: fontSize,
      textAlign: 'left',
      verticalAlign: 'top',
      wordBreak: 'normal',
      overflow: 'visible',
      minInlineSize: 'auto'
    }
  };

  if (lineHeight.value > 0 && lineHeight.units === 'PIXELS') {
    elem.detail.lineHeight = lineHeight.value;
  }

  // if (!((elem.detail.lineHeight as number) > 0 && elemBase.h > (elem.detail.lineHeight as number))) {
  //   elem.detail.minInlineSize = 'maxContent';
  // }

  const color = figmaPaintsToHexColor(fillPaints);
  if (color) {
    elem.detail.color = color;
  }

  if (typeof node.opacity === 'number' && node.opacity >= 0) {
    elem.detail.opacity = node.opacity;
  }

  if (Array.isArray(fontMetaData) && fontMetaData.length > 0) {
    const fontMeta = fontMetaData[0];
    const { fontWeight = defaultFontWeight } = fontMeta;
    elem.detail.fontWeight = fontWeight;
    // elem.detail.lineHeight = fontLineHeight * fontSize;
  }

  if (textAlignHorizontal === 'LEFT') {
    elem.detail.textAlign = 'left';
  } else if (textAlignHorizontal === 'RIGHT') {
    elem.detail.textAlign = 'right';
  } else if (textAlignHorizontal === 'CENTER') {
    elem.detail.textAlign = 'center';
  }

  if (textAlignVertical === 'TOP') {
    elem.detail.verticalAlign = 'top';
  } else if (textAlignVertical === 'BOTTOM') {
    elem.detail.verticalAlign = 'bottom';
  } else if (textAlignVertical === 'CENTER') {
    elem.detail.verticalAlign = 'middle';
  }

  if (textCase === 'UPPER') {
    elem.detail.textTransform = 'uppercase';
  } else if (textCase === 'LOWER') {
    elem.detail.textTransform = 'lowercase';
  }

  const operations: Required<Element<'text'>>['operations'] = nodeToOperations(node as FigmaNode);
  elem.operations = operations;

  return elem;
}
