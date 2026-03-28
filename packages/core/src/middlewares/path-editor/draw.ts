import type { ViewContext2D, StrictMaterial, ViewScaleInfo, ViewSizeInfo, Point } from '@idraw/types';
import {
  convertPathCommandsToContext2DCommands,
  calcViewPoint,
  rotateMaterial,
  calcViewMaterialSize,
} from '@idraw/util';
import { parseBezierCurveTo, parseMoveTo, parseEllipse } from './parse';
import type { CommandItem } from './types';

export function drawAncor(
  ctx: ViewContext2D,
  center: Point
  // opts: { borderColor: string; borderWidth: number; background: string; lineDash: number[] }
) {
  const { x, y } = center;
  const w = 12;
  const h = 12;
  // const { borderColor, borderWidth, background, lineDash } = opts;
  const borderColor = '#0000ff'; // TODO
  const borderWidth = 2; // TODO
  const background = '#ffffffaf'; // TODO
  const lineDash: number[] = []; // TODO
  ctx.setLineDash([]);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
  ctx.fillStyle = background;
  ctx.setLineDash(lineDash);
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h / 2);
  ctx.lineTo(x + w / 2, y - h / 2);
  ctx.lineTo(x + w / 2, y + h / 2);
  ctx.lineTo(x - w / 2, y + h / 2);
  ctx.lineTo(x - w / 2, y - h / 2);
  ctx.closePath();
  ctx.stroke();
  ctx.fill('nonzero');
}

export function drawBreakpoint(
  ctx: ViewContext2D,
  center: Point
  // opts: { borderColor: string; borderWidth: number; background: string; lineDash: number[] }
) {
  // const { x, y } = center;
  const w = 12;
  const h = 12;
  // const { borderColor, borderWidth, background, lineDash } = opts;
  const borderColor = '#ff0000'; // TODO
  const borderWidth = 2; // TODO
  const background = '#ffffffaf'; // TODO
  const lineDash: number[] = []; // TODO
  ctx.setLineDash([]);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
  ctx.fillStyle = background;
  ctx.setLineDash(lineDash);
  ctx.beginPath();
  // ctx.moveTo(x - w / 2, y - h / 2);
  ctx.circle(center.x, center.y, w / 2, h / 2, 0, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function drawPathAnchor(
  ctx: ViewContext2D,
  material: StrictMaterial<'path'> | null,
  opts: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
  }
) {
  if (!(material?.type === 'path' && Array.isArray(material?.commands))) {
    return;
  }
  const { x, y, commands } = material;
  const viewElemSize = calcViewMaterialSize(material, opts);
  const ctxCmds = convertPathCommandsToContext2DCommands(commands);

  ctx.strokeStyle = 'blue'; // TODO
  ctx.lineWidth = 1; // TODO

  const scalePoint = (p: Point) => ({
    x: p.x * opts.viewScaleInfo.scale,
    y: p.y * opts.viewScaleInfo.scale,
  });

  // const start = calcViewPoint({ x, y }, opts);
  const movePoint = (p: Point) => ({
    x: p.x + x,
    y: p.y + y,
  });
  let current: Point | null = null;
  const cmdItems: CommandItem[] = [];

  rotateMaterial(ctx, viewElemSize, () => {
    ctxCmds.forEach((cmd) => {
      if (cmd.name === 'moveTo') {
        const p = calcViewPoint(movePoint({ x: cmd.params.x, y: cmd.params.y }), opts);
        ctx.moveTo(p.x, p.y);
        cmdItems.push(parseMoveTo({ ...cmd, params: { ...p } }));

        current = { x: p.x, y: p.y };
      } else if (cmd.name === 'bezierCurveTo') {
        const cp1 = calcViewPoint(movePoint({ x: cmd.params.cp1x, y: cmd.params.cp1y }), opts);
        const cp2 = calcViewPoint(movePoint({ x: cmd.params.cp2x, y: cmd.params.cp2y }), opts);
        const p = calcViewPoint(movePoint({ x: cmd.params.x, y: cmd.params.y }), opts);

        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y);

        cmdItems.push(
          parseBezierCurveTo(current as Point, {
            ...cmd,
            params: {
              cp1x: cp1.x,
              cp1y: cp1.y,
              cp2x: cp2.x,
              cp2y: cp2.y,
              x: p.x,
              y: p.y,
            },
          })
        );
        current = { x: p.x, y: p.y };
      } else if (cmd.name === 'ellipse') {
        const center = calcViewPoint(movePoint({ x: cmd.params.centerX, y: cmd.params.centerY }), opts);
        const radius = scalePoint({ x: cmd.params.radiusX, y: cmd.params.radiusY });
        ctx.ellipse(
          center.x,
          center.y,
          radius.x,
          radius.y,
          cmd.params.rotation,
          cmd.params.startRadian,
          cmd.params.endRadian,
          cmd.params.anticlockwise
        );

        cmdItems.push(
          parseEllipse(current as Point, {
            ...cmd,
            params: {
              centerX: center.x,
              centerY: center.y,
              radiusX: radius.x,
              radiusY: radius.y,
              rotation: cmd.params.rotation,
              startRadian: cmd.params.startRadian,
              endRadian: cmd.params.endRadian,
              anticlockwise: cmd.params.anticlockwise,
            },
          })
        );
      } else if (cmd.name === 'beginPath') {
        ctx.beginPath();
      } else if (cmd.name === 'closePath') {
        ctx.closePath();
      }
    });
    ctx.stroke();
    cmdItems.forEach((item) => {
      drawBreakpoint(ctx, item.end);
    });
  });
}
