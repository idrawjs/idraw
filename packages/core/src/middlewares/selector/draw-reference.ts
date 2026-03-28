import type { ViewContext2D, Point, MiddlewareSelectorStyles } from '@idraw/types';
import { drawLine, drawCrossByCenter } from './draw-base';

export function drawReferenceLines(
  ctx: ViewContext2D,
  opts: {
    xLines?: Array<Point[]>;
    yLines?: Array<Point[]>;
    styles: MiddlewareSelectorStyles;
  }
) {
  const { xLines, yLines, styles } = opts;
  const { referenceColor } = styles;
  const lineOpts = {
    stroke: referenceColor,
    strokeWidth: 1,
    lineDash: [],
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
