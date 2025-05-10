import type { Element, CalcVirtualDetailOptions, VirtualFlatTextDetail, VirtualFlatTextLine } from '@idraw/types';
import { enhanceFontFamliy, getDefaultElementDetailConfig } from '@idraw/util';

const detailConfig = getDefaultElementDetailConfig();

// TODO
function isTextWidthWithinErrorRange(w0: number, w1: number, scale: number): boolean {
  if (scale < 0.5) {
    if (w0 < w1 && (w0 - w1) / w0 > -0.15) {
      return true;
    }
  }
  return w0 >= w1;
}

export function calcVirtualTextDetail(elem: Element<'text'>, opts: CalcVirtualDetailOptions): VirtualFlatTextDetail {
  const { w, h } = elem;
  const x = 0;
  const y = 0;
  const ctx = opts.tempContext;

  const lines: VirtualFlatTextLine[] = [];
  const detail: Element<'text'>['detail'] = {
    ...detailConfig,
    ...elem.detail
  };
  const originFontSize = detail.fontSize || detailConfig.fontSize;
  const fontSize = originFontSize;

  if (fontSize < 2) {
    return {};
  }

  const originLineHeight = detail.lineHeight || originFontSize;
  const lineHeight = originLineHeight;

  ctx.textBaseline = 'top';
  ctx.$setFont({
    fontWeight: detail.fontWeight,
    fontSize: fontSize,
    fontFamily: enhanceFontFamliy(detail.fontFamily)
  });
  let detailText = detail.text.replace(/\r\n/gi, '\n');
  if (detail.textTransform === 'lowercase') {
    detailText = detailText.toLowerCase();
  } else if (detail.textTransform === 'uppercase') {
    detailText = detailText.toUpperCase();
  }

  const fontHeight = lineHeight;
  const detailTextList = detailText.split('\n');

  let lineNum = 0;
  detailTextList.forEach((itemText: string, idx: number) => {
    if (detail.minInlineSize === 'maxContent') {
      lines.push({
        x,
        y: 0, // TODO
        text: itemText,
        width: ctx.$undoPixelRatio(ctx.measureText(itemText).width)
      });
    } else {
      let lineText = '';
      let splitStr = '';
      let tempStrList: string[] = itemText.split(splitStr);
      if (detail.wordBreak === 'normal') {
        splitStr = ' ';
        const wordList = itemText.split(splitStr);
        tempStrList = [];
        wordList.forEach((word: string, idx: number) => {
          tempStrList.push(word);
          if (idx < wordList.length - 1) {
            tempStrList.push(splitStr);
          }
        });
      }

      if (tempStrList.length === 1 && detail.overflow === 'visible') {
        lines.push({
          x,
          y: 0, // TODO
          text: tempStrList[0],
          width: ctx.$undoPixelRatio(ctx.measureText(tempStrList[0]).width)
        });
      } else if (tempStrList.length > 0) {
        for (let i = 0; i < tempStrList.length; i++) {
          if (isTextWidthWithinErrorRange(ctx.$doPixelRatio(w), ctx.measureText(lineText + tempStrList[i]).width, 1)) {
            lineText += tempStrList[i] || '';
          } else {
            lines.push({
              x,
              y: 0, // TODO
              text: lineText,
              width: ctx.$undoPixelRatio(ctx.measureText(lineText).width)
            });
            lineText = tempStrList[i] || '';
            lineNum++;
          }
          if ((lineNum + 1) * fontHeight > h && detail.overflow === 'hidden') {
            break;
          }
          if (tempStrList.length - 1 === i) {
            if ((lineNum + 1) * fontHeight <= h) {
              lines.push({
                x,
                y: 0, // TODO
                text: lineText,
                width: ctx.$undoPixelRatio(ctx.measureText(lineText).width)
              });
              if (idx < detailTextList.length - 1) {
                lineNum++;
              }
              break;
            }
          }
        }
      } else {
        lines.push({
          x,
          y: 0, // TODO
          text: '',
          width: 0
        });
      }
    }
  });

  let startY = 0;
  let eachLineStartY = 0;
  if (fontHeight > fontSize) {
    eachLineStartY = (fontHeight - fontSize) / 2;
  }
  if (lines.length * fontHeight < h) {
    if (detail.verticalAlign === 'top') {
      startY = 0;
    } else if (detail.verticalAlign === 'bottom') {
      startY += h - lines.length * fontHeight;
    } else {
      // middle and default
      startY += (h - lines.length * fontHeight) / 2;
    }
  }

  // draw text lines
  {
    const _y = y + startY;
    lines.forEach((line, i) => {
      let _x = x;
      if (detail.textAlign === 'center') {
        _x = x + (w - line.width) / 2;
      } else if (detail.textAlign === 'right') {
        _x = x + (w - line.width);
      }
      lines[i].x = _x;
      lines[i].y = _y + fontHeight * i + eachLineStartY;
    });
  }

  const virtualTextDetail: VirtualFlatTextDetail = {
    textLines: lines
  };
  return virtualTextDetail;
}
