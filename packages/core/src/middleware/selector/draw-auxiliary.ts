import type { ViewContext2D, ViewRectVertexes, Element } from '@idraw/types';
import { drawLine } from './draw-base';

const auxiliaryColor = '#f7276e';
// const auxiliaryTextColor = '#FFFFFF';
// const fontSize = 12;
// const fontFamily = 'Consolas,Monaco,monospace';
// const fontWeight = 600;

// function drawLabel(
//   ctx,
//   opts: {
//     text: string;
//     start: PointSize;
//     textColor: string;
//     background: string;
//   }
// ) {
//   // TODO
// }

export function drawSizeAuxiliaryLines(
  ctx: ViewContext2D,
  opts: {
    vertexes: ViewRectVertexes;
    element: Element | null;
    groupQueue: Element<'group'>[];
  }
) {
  const { vertexes, element, groupQueue } = opts;
  const point = vertexes[0];
  const lineOpts = {
    borderColor: auxiliaryColor,
    borderWidth: 1,
    lineDash: []
    // lineDash: [4, 4]
  };
  if (groupQueue.length > 0) {
    // TODO
  } else {
    if (!element?.angle) {
      drawLine(ctx, { x: point.x, y: 0 }, point, lineOpts);
      drawLine(ctx, { x: 0, y: point.y }, point, lineOpts);

      // {
      //   const xNum = `${element?.x}`;
      //   const w = xNum.length * fontSize;
      //   const h = fontSize;
      //   const x = point.x / 2 - xNum.length * fontSize;
      //   const y = point.y + fontSize / 2;
      //   ctx.$setFont({
      //     fontSize,
      //     fontFamily,
      //     fontWeight
      //   });
      //   ctx.moveTo(x, y);
      //   ctx.lineTo(x + w, y);
      //   ctx.lineTo(x + w, y + h);
      //   ctx.lineTo(x, y + h);
      //   ctx.lineTo(x, y);
      //   ctx.fillStyle = auxiliaryColor;
      //   ctx.fill();

      //   ctx.fillStyle = auxiliaryTextColor;
      //   ctx.fillText(xNum, x, y, w);
      // }
    }
  }
}
