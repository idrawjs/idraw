import type {
  StrictMaterial,
  CalcVirtualAttributesOptions,
  VirtualTextAttributes,
  VirtualTextLine,
} from '@idraw/types';
import { enhanceFontFamliy, getDefaultMaterialAttributes } from '@idraw/util';
import { calcVirtualRectAttributes } from './rect';

const attributesConfig = getDefaultMaterialAttributes();

// TODO
function isTextWidthWithinErrorRange(w0: number, w1: number, scale: number): boolean {
  if (scale < 0.5) {
    if (w0 < w1 && (w0 - w1) / w0 > -0.15) {
      return true;
    }
  }
  return w0 >= w1;
}

export function calcVirtualTextAttributes(
  mtrl: StrictMaterial<'text'>,
  opts: CalcVirtualAttributesOptions
): VirtualTextAttributes {
  const { width, height } = mtrl;
  const x = 0;
  const y = 0;
  const ctx = opts.tempContext;

  const lines: VirtualTextLine[] = [];
  const attributes: StrictMaterial<'text'> = {
    ...attributesConfig,
    ...mtrl,
  };
  const originFontSize = attributes.fontSize || attributesConfig.fontSize;
  const fontSize = originFontSize;
  const baseAttrs = calcVirtualRectAttributes(mtrl, opts);

  if (fontSize < 2) {
    return { ...baseAttrs, textLines: [] };
  }

  const originLineHeight = attributes.lineHeight || originFontSize;
  const lineHeight = originLineHeight;

  ctx.textBaseline = 'top';
  ctx.$setFont({
    fontWeight: attributes.fontWeight,
    fontSize: fontSize,
    fontFamily: enhanceFontFamliy(attributes.fontFamily),
  });
  let attributesText = attributes.text.replace(/\r\n/gi, '\n');
  if (attributes.textTransform === 'lowercase') {
    attributesText = attributesText.toLowerCase();
  } else if (attributes.textTransform === 'uppercase') {
    attributesText = attributesText.toUpperCase();
  }

  const fontHeight = lineHeight;
  const attributesTextList = attributesText.split('\n');

  let lineNum = 0;
  attributesTextList.forEach((itemText: string, idx: number) => {
    if (attributes.minInlineSize === 'maxContent') {
      const measureResult = ctx.measureText(itemText);
      lines.push({
        x,
        y: 0,
        text: itemText,
        width: ctx.$undoPixelRatio(measureResult.width),
      });
    } else {
      let lineText = '';
      let splitStr = '';
      let tempCharList: string[] = itemText.split(splitStr);

      if (attributes.wordBreak === 'normal') {
        splitStr = ' ';
        const wordList = itemText.split(splitStr);
        tempCharList = [];
        wordList.forEach((word: string, idx: number) => {
          tempCharList.push(word);
          if (idx < wordList.length - 1) {
            tempCharList.push(splitStr);
          }
        });
      }

      if (tempCharList.length === 1 && attributes.overflow !== 'hidden') {
        lines.push({
          x,
          y: 0,
          text: tempCharList[0],
          width: ctx.$undoPixelRatio(ctx.measureText(tempCharList[0]).width),
        });
      } else if (tempCharList.length > 0) {
        for (let i = 0; i < tempCharList.length; i++) {
          if (
            isTextWidthWithinErrorRange(ctx.$doPixelRatio(width), ctx.measureText(lineText + tempCharList[i]).width, 1)
          ) {
            lineText += tempCharList[i] || '';
          } else {
            lines.push({
              x,
              y: 0,
              text: lineText,
              width: ctx.$undoPixelRatio(ctx.measureText(lineText).width),
            });
            lineText = tempCharList[i] || '';
            lineNum++;
          }

          if (lineNum * fontHeight >= height) {
            if (attributes.overflow === 'hidden') {
              lineText = '';
              break;
            }
          }
          if (tempCharList.length - 1 === i) {
            if ((lineNum + 1) * fontHeight <= height) {
              lines.push({
                x,
                y: 0,
                text: lineText,
                width: ctx.$undoPixelRatio(ctx.measureText(lineText).width),
              });
              lineText = '';
              if (idx < attributesTextList.length - 1) {
                lineNum++;
              }
              break;
            }
          }
        }

        if (lineText) {
          lines.push({
            x,
            y: 0,
            text: lineText,
            width: ctx.$undoPixelRatio(ctx.measureText(lineText).width),
          });
          // eslint-disable-next-line no-useless-assignment
          lineText = '';
        }
      } else {
        lines.push({
          x,
          y: 0,
          text: '',
          width: 0,
        });
      }
    }
  });

  let startY = 0;
  let eachLineStartY = 0;
  if (fontHeight > fontSize) {
    eachLineStartY = (fontHeight - fontSize) / 2;
  }
  if (lines.length * fontHeight < height) {
    if (attributes.verticalAlign === 'top') {
      startY = 0;
    } else if (attributes.verticalAlign === 'bottom') {
      startY += height - lines.length * fontHeight;
    } else {
      // middle and default
      startY += (height - lines.length * fontHeight) / 2;
    }
  }

  // draw text lines
  {
    const _y = y + startY;
    lines.forEach((line, i) => {
      let _x = x;
      if (attributes.textAlign === 'center') {
        _x = x + (width - line.width) / 2;
      } else if (attributes.textAlign === 'right') {
        _x = x + (width - line.width);
      }
      lines[i].x = _x;
      lines[i].y = _y + fontHeight * i + eachLineStartY;
    });
  }

  const virtualTextAttributes: VirtualTextAttributes = {
    ...baseAttrs,
    textLines: lines,
  };

  return virtualTextAttributes;
}
