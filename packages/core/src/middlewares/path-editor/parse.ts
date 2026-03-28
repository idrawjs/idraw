import { rotatePoint } from '@idraw/util';
import type { Point, Context2DMoveToCommand, Context2DBezierCurveCommand, Context2DEllipseCommand } from '@idraw/types';
import type { CommandItem } from './types';

export function parseMoveTo(cmd: Context2DMoveToCommand): CommandItem {
  const { id, name, params } = cmd;
  const { x, y } = params;
  const item: CommandItem = {
    id,
    name,
    start: { x, y },
    end: { x, y },
  };
  return item;
}

export function parseBezierCurveTo(prevPoint: Point, cmd: Context2DBezierCurveCommand) {
  const { id, name, params } = cmd;
  const { cp1x, cp1y, cp2x, cp2y, x, y } = params;
  const item: CommandItem = {
    id,
    name,
    start: { x: prevPoint.x, y: prevPoint.y },
    end: { x, y },
    ctrl1: { x: cp1x, y: cp1y },
    ctrl2: { x: cp2x, y: cp2y },
  };
  return item;
}

export function parseEllipse(prevPoint: Point, cmd: Context2DEllipseCommand) {
  const { id, name, params } = cmd;
  const { centerX, centerY, endRadian, startRadian } = params;
  const item: CommandItem = {
    id,
    name,
    start: { x: prevPoint.x, y: prevPoint.y },
    end: rotatePoint({ x: centerX, y: centerY }, prevPoint, endRadian - startRadian),
    center: { x: centerX, y: centerY },
  };
  return item;
}
