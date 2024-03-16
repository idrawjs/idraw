import type { ViewContext2D, PointSize } from '@idraw/types';
import { referenceColor } from './config';
import { drawLine, drawCrossByCenter } from './draw-base';

export function drawReferenceLines(
  ctx: ViewContext2D,
  opts: {
    xLines?: Array<PointSize[]>;
    yLines?: Array<PointSize[]>;
  }
) {
  const { xLines, yLines } = opts;
  const lineOpts = {
    borderColor: referenceColor,
    borderWidth: 1,
    lineDash: []
  };
  const crossOpts = { ...lineOpts, size: 6 };

  if (xLines) {
    xLines.forEach((line) => {
      line.forEach((p, pIdx) => {
        drawCrossByCenter(ctx, p, crossOpts);
        if (line[pIdx + 1]) {
          drawLine(ctx, line[pIdx], line[pIdx + 1], lineOpts);
        }
      });
    });
  }

  if (yLines) {
    yLines.forEach((line) => {
      line.forEach((p, pIdx) => {
        drawCrossByCenter(ctx, p, crossOpts);
        if (line[pIdx + 1]) {
          drawLine(ctx, line[pIdx], line[pIdx + 1], lineOpts);
        }
      });
    });
  }
}
