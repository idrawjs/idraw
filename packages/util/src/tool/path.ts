/* eslint-disable no-duplicate-case */
import type { PathCommand, PathAnchorCommand, Point } from '@idraw/types';
import { createId } from './id';

/**
 * Applies coordinate offsets to a single path command
 * @param command - Path command object
 * @param x - Horizontal offset
 * @param y - Vertical offset
 * @returns Transformed command string
 */
export function shiftPathCommand<T extends PathCommand | PathAnchorCommand = PathCommand>(
  command: T,
  x: number,
  y: number
): T {
  const { type } = command;
  const params = [...command.params];
  const id = command.id;
  let anchorInfo: Partial<PathAnchorCommand> = { id };
  if ((command as PathAnchorCommand).start && (command as PathAnchorCommand).end) {
    const start = { ...(command as PathAnchorCommand).start };
    const end = { ...(command as PathAnchorCommand).end };
    start.x += x;
    start.y += y;
    end.x += x;
    end.y += y;
    anchorInfo = { id, start, end };
  }

  switch (type) {
    // MoveTo: Apply offset to both coordinates
    case 'M': {
      params[0] += x;
      params[1] += y;
      return { type, params, ...anchorInfo } as T;
    }

    // LineTo: Apply offset to both coordinates
    case 'L': {
      params[0] += x;
      params[1] += y;
      return { type, params, ...anchorInfo } as T;
    }

    // Horizontal Line: Only apply x offset
    case 'H': {
      params[0] += x;
      return { type, params, ...anchorInfo } as T;
    }

    // Vertical Line: Only apply y offset
    case 'V': {
      params[0] += y;
      return { type, params, ...anchorInfo } as T;
    }

    // Cubic Bezier: Offset all control points and endpoint
    case 'C': {
      params[0] += x;
      params[1] += y;
      params[2] += x;
      params[3] += y;
      params[4] += x;
      params[5] += y;
      return { type, params, ...anchorInfo } as T;
    }

    case 'S': {
      params[0] += x;
      params[1] += y;
      params[2] += x;
      params[3] += y;
      return { type, params, ...anchorInfo } as T;
    }

    // Quadratic Bezier: Offset both control point and endpoint
    case 'Q': {
      params[0] += x;
      params[1] += y;
      params[2] += x;
      params[3] += y;
      return { type, params, ...anchorInfo } as T;
    }

    case 'T': {
      params[0] += x;
      params[1] += y;
      return { type, params, ...anchorInfo } as T;
    }

    // Arc: Only offset endpoint (radius/rotation remain unchanged)
    case 'A': {
      params[5] += x;
      params[6] += y;
      return { type, params, ...anchorInfo } as T;
    }
    // ClosePath: No coordinates to modify
    case 'Z': {
      return { type, params, ...anchorInfo } as T;
    }

    // Default: Return original command if unsupported
    default: {
      return { type, params, ...anchorInfo } as T;
    }
  }
}

export function shiftPathCommands<T extends PathCommand | PathAnchorCommand = PathCommand>(
  commands: T[],
  x: number,
  y: number
): T[] {
  const cmds: T[] = [];
  commands.forEach((command) => {
    const cmd = shiftPathCommand<T>(command, x, y);
    cmds.push(cmd);
  });
  return cmds;
}

/**
 * Scales an SVG path by specified X and Y factors
 * @param path - Array of SVG path commands
 * @param scaleX - Scaling factor for the X dimension
 * @param scaleY - Scaling factor for the Y dimension
 * @returns New array of scaled path commands
 */
export function scalePathCommands<T extends PathCommand | PathAnchorCommand = PathCommand>(
  path: T[],
  scaleX: number,
  scaleY: number
): T[] {
  return path.map((cmd) => {
    const { id, type, params } = cmd;
    const newParams: number[] = [];

    let anchorInfo: Partial<PathAnchorCommand> = { id };
    if ((cmd as PathAnchorCommand).start && (cmd as PathAnchorCommand).end) {
      const start = { ...(cmd as PathAnchorCommand).start };
      const end = { ...(cmd as PathAnchorCommand).end };
      start.x *= scaleX;
      start.y *= scaleY;
      end.x *= scaleX;
      end.y *= scaleY;
      anchorInfo = { id, start, end };
    }

    // Process different command types
    switch (type.toUpperCase()) {
      // MoveTo, LineTo, and Smooth Quadratic Bezier Curve
      case 'M':
      case 'L':
      case 'T':
        // Scale coordinate pairs (x, y)
        for (let i = 0; i < params.length; i += 2) {
          newParams.push(params[i] * scaleX, params[i + 1] * scaleY);
        }
        break;

      // Cubic Bezier Curve
      case 'C':
        // Scale two control points and end point (x1,y1, x2,y2, x,y)
        for (let i = 0; i < params.length; i += 6) {
          newParams.push(
            params[i] * scaleX,
            params[i + 1] * scaleY,
            params[i + 2] * scaleX,
            params[i + 3] * scaleY,
            params[i + 4] * scaleX,
            params[i + 5] * scaleY
          );
        }
        break;

      // Smooth Cubic Bezier Curve
      case 'S':
        // Scale control point and end point (x2,y2, x,y)
        for (let i = 0; i < params.length; i += 4) {
          newParams.push(params[i] * scaleX, params[i + 1] * scaleY, params[i + 2] * scaleX, params[i + 3] * scaleY);
        }
        break;

      // Quadratic Bezier Curve
      case 'Q':
        // Scale control point and end point (x1,y1, x,y)
        for (let i = 0; i < params.length; i += 4) {
          newParams.push(params[i] * scaleX, params[i + 1] * scaleY, params[i + 2] * scaleX, params[i + 3] * scaleY);
        }
        break;

      // Horizontal Line
      case 'H':
        // Scale only X coordinates
        params.forEach((val) => newParams.push(val * scaleX));
        break;

      // Vertical Line
      case 'V':
        // Scale only Y coordinates
        params.forEach((val) => newParams.push(val * scaleY));
        break;

      // Elliptical Arc
      case 'A':
        // Scale radii (rx, ry) and end point (x, y)
        // Keep flags and rotation unchanged
        for (let i = 0; i < params.length; i += 7) {
          newParams.push(
            params[i] * scaleX, // rx
            params[i + 1] * scaleY, // ry
            params[i + 2], // x-axis-rotation
            params[i + 3], // large-arc-flag
            params[i + 4], // sweep-flag
            params[i + 5] * scaleX, // x
            params[i + 6] * scaleY // y
          );
        }
        break;

      // Relative coordinate commands
      case 'M':
      case 'L':
      case 'C':
      case 'S':
      case 'Q':
      case 'T':
      case 'A':
      case 'H':
      case 'V':
        // Handle relative commands same as absolute
        // Determine scaling dimension for each parameter
        for (let i = 0; i < params.length; i++) {
          const isXParam =
            (type === 'a' && (i % 7 === 0 || i % 7 === 5)) || // rx and x in arcs
            type === 'h' || // horizontal moves
            (type !== 'v' && i % 2 === 0); // even indices in other commands

          newParams.push(params[i] * (isXParam ? scaleX : scaleY));
        }
        break;

      // ClosePath command and unknown commands
      default:
        return { type, params: [...params], ...anchorInfo };
    }

    return { type, params: newParams, ...anchorInfo };
  }) as T[];
}

/**
 * Converts SVG path commands to use only M, C, A, and Z commands
 * @param commands - Array of SVG path command objects
 * @returns Simplified path commands using only M/C/A/Z
 */
export function convertPathCommandsToACLMZ(commands: PathCommand[]): PathAnchorCommand[] {
  const output: PathAnchorCommand[] = [];
  let currentPoint: Point = { x: 0, y: 0 };
  let startPoint: Point = { x: 0, y: 0 };
  let prevControlPoint: Point | null = null;

  for (const command of commands) {
    const type = command.type;
    const params = command.params;
    const isRelative = type === type.toLowerCase();
    const absCommand = type.toUpperCase();
    const id = command.id;

    switch (absCommand) {
      case 'M': {
        const [x, y] = params;
        const point = isRelative ? { x: currentPoint.x + x, y: currentPoint.y + y } : { x, y };

        output.push({ id, type: 'M', params: [point.x, point.y], start: { x, y }, end: { x, y } });
        currentPoint = point;
        startPoint = point;
        prevControlPoint = null;
        break;
      }

      case 'L': {
        const [x, y] = params;
        const point = isRelative ? { x: currentPoint.x + x, y: currentPoint.y + y } : { x, y };
        output.push({
          id,
          type: 'L',
          params: [point.x, point.y],
          start: { ...currentPoint },
          end: { ...point },
        });
        currentPoint = point;
        prevControlPoint = null;
        break;
      }

      case 'H': {
        const [x] = params;
        const point = isRelative ? { x: currentPoint.x + x, y: currentPoint.y } : { x, y: currentPoint.y };

        output.push({
          id,
          type: 'L',
          params: [point.x, point.y],
          start: { ...currentPoint },
          end: { ...point },
        });
        currentPoint = point;
        prevControlPoint = null;
        break;
      }

      case 'V': {
        const [y] = params;
        const point = isRelative ? { x: currentPoint.x, y: currentPoint.y + y } : { x: currentPoint.x, y };

        output.push({
          id,
          type: 'L',
          params: [point.x, point.y],
          start: { ...currentPoint },
          end: { ...point },
        });
        currentPoint = point;
        prevControlPoint = null;
        break;
      }

      case 'C': {
        const [x1, y1, x2, y2, x, y] = params;
        const c1 = isRelative ? { x: currentPoint.x + x1, y: currentPoint.y + y1 } : { x: x1, y: y1 };
        const c2 = isRelative ? { x: currentPoint.x + x2, y: currentPoint.y + y2 } : { x: x2, y: y2 };
        const point = isRelative ? { x: currentPoint.x + x, y: currentPoint.y + y } : { x, y };

        output.push({
          id,
          type: 'C',
          params: [c1.x, c1.y, c2.x, c2.y, point.x, point.y],
          start: { ...currentPoint },
          end: { ...point },
        });
        currentPoint = point;
        prevControlPoint = c2;
        break;
      }

      case 'S': {
        const [x2, y2, x, y] = params;
        // Calculate reflection of previous control point
        const c1 = prevControlPoint
          ? {
              x: 2 * currentPoint.x - prevControlPoint.x,
              y: 2 * currentPoint.y - prevControlPoint.y,
            }
          : currentPoint;
        const c2 = isRelative ? { x: currentPoint.x + x2, y: currentPoint.y + y2 } : { x: x2, y: y2 };
        const point = isRelative ? { x: currentPoint.x + x, y: currentPoint.y + y } : { x, y };

        output.push({
          id,
          type: 'C',
          params: [c1.x, c1.y, c2.x, c2.y, point.x, point.y],
          start: { ...currentPoint },
          end: { ...point },
        });
        currentPoint = point;
        prevControlPoint = c2;
        break;
      }

      case 'Q': {
        const [x1, y1, x, y] = params;
        const cp1 = isRelative ? { x: currentPoint.x + x1, y: currentPoint.y + y1 } : { x: x1, y: y1 };
        const endPoint = isRelative ? { x: currentPoint.x + x, y: currentPoint.y + y } : { x, y };

        // Convert quadratic to cubic Bezier
        output.push({
          id,
          type: 'C',
          params: [
            currentPoint.x + (2 / 3) * (cp1.x - currentPoint.x),
            currentPoint.y + (2 / 3) * (cp1.y - currentPoint.y),
            endPoint.x + (2 / 3) * (cp1.x - endPoint.x),
            endPoint.y + (2 / 3) * (cp1.y - endPoint.y),
            endPoint.x,
            endPoint.y,
          ],
          start: { ...currentPoint },
          end: { ...endPoint },
        });
        currentPoint = endPoint;
        prevControlPoint = cp1;
        break;
      }

      case 'T': {
        const [x, y] = params;
        const endPoint = isRelative ? { x: currentPoint.x + x, y: currentPoint.y + y } : { x, y };

        // Calculate reflection of previous quadratic control point
        const cp1: Point = prevControlPoint
          ? {
              x: 2 * currentPoint.x - prevControlPoint.x,
              y: 2 * currentPoint.y - prevControlPoint.y,
            }
          : currentPoint;

        // Convert to cubic Bezier
        output.push({
          id,
          type: 'C',
          params: [
            currentPoint.x + (2 / 3) * (cp1.x - currentPoint.x),
            currentPoint.y + (2 / 3) * (cp1.y - currentPoint.y),
            endPoint.x + (2 / 3) * (cp1.x - endPoint.x),
            endPoint.y + (2 / 3) * (cp1.y - endPoint.y),
            endPoint.x,
            endPoint.y,
          ],
          start: { ...currentPoint },
          end: { ...endPoint },
        });
        currentPoint = endPoint;
        prevControlPoint = cp1;
        break;
      }

      case 'A': {
        const [rx, ry, rotation, largeArc, sweep, x, y] = params;
        const point = isRelative ? { x: currentPoint.x + x, y: currentPoint.y + y } : { x, y };

        output.push({
          id,
          type: 'A',
          params: [rx, ry, rotation, largeArc, sweep, point.x, point.y],
          start: { ...currentPoint },
          end: { ...point },
        });
        currentPoint = point;
        prevControlPoint = null;
        break;
      }

      case 'Z': {
        output.push({ id, type: 'Z', params: [], start: { ...currentPoint }, end: { ...startPoint } });
        currentPoint = startPoint;
        prevControlPoint = null;
        break;
      }

      default:
        throw new Error(`Unsupported command: ${type}`);
    }
  }

  return output;
}

export function moveInAnchorCommands(
  acmds: PathAnchorCommand[],
  opts: {
    index: number;
    type: 'start' | 'end';
    moveX: number;
    moveY: number;
  }
): PathAnchorCommand[] {
  const cmds: PathCommand[] = [];
  const { index, moveX, moveY } = opts;
  acmds.forEach((acmd) => {
    const { id, type, params } = acmd;
    const cmd = { id, type, params: [...params] };
    cmds.push(cmd);
  });
  const cmd = cmds[index];
  const prevCmd = cmds[index - 1];

  if (opts.type === 'start') {
    if (!(prevCmd && cmd)) {
      return convertPathCommandsToACLMZ(cmds);
    }
    if (cmd.type === 'M') {
      cmd.params[0] += moveX;
      cmd.params[1] += moveY;
    }
    if (cmd.type === 'C') {
      cmd.params[0] += moveX;
      cmd.params[1] += moveY;
    }
    switch (prevCmd.type) {
      case 'M': {
        prevCmd.params[0] += moveX;
        prevCmd.params[1] += moveY;
        break;
      }
      case 'L': {
        prevCmd.params[0] += moveX;
        prevCmd.params[1] += moveY;
        break;
      }
      case 'A': {
        // previous command end
        prevCmd.params[5] += moveX;
        prevCmd.params[6] += moveY;
        break;
      }
      case 'C': {
        // previous command end
        prevCmd.params[2] += moveX;
        prevCmd.params[3] += moveY;
        prevCmd.params[4] += moveX;
        prevCmd.params[5] += moveY;
        break;
      }
      case 'Z': {
        prevCmd.params[0] += moveX;
        prevCmd.params[1] += moveY;
        break;
      }
      default: {
        break;
      }
    }
  } else {
    // TODO
    // if (!cmd) {
    //   return cmds;
    // }
    // switch (cmd.type) {
    //   case 'M': {
    //     cmd.params[0] += moveX;
    //     cmd.params[1] += moveY;
    //     break;
    //   }
    //   case 'A': {
    //     cmd.params[5] += moveX;
    //     cmd.params[6] += moveY;
    //     break;
    //   }
    //   case 'C': {
    //     // previous command end
    //     cmd.params[2] += moveX;
    //     cmd.params[3] += moveY;
    //     cmd.params[4] += moveX;
    //     cmd.params[5] += moveY;
    //     break;
    //   }
    //   case 'Z': {
    //     cmd.params[0] += moveX;
    //     cmd.params[1] += moveY;
    //     break;
    //   }
    //   default: {
    //     break;
    //   }
    // }
  }

  return convertPathCommandsToACLMZ(cmds);
}

export function moveCurveCtrlInAnchorCommands(
  acmds: PathAnchorCommand[],
  opts: {
    index: number;
    type: 'curve-ctrl1' | 'curve-ctrl2';
    moveX: number;
    moveY: number;
  }
): PathAnchorCommand[] {
  const cmds: PathCommand[] = [];
  const { index, type, moveX, moveY } = opts;
  acmds.forEach((acmd) => {
    const { id, type, params } = acmd;
    const cmd = { id, type, params: [...params] };
    cmds.push(cmd);
  });
  const cmd = cmds[index];

  if (cmd.type === 'C') {
    if (type === 'curve-ctrl1') {
      cmd.params[0] += moveX;
      cmd.params[1] += moveY;
    } else if (type === 'curve-ctrl2') {
      cmd.params[2] += moveX;
      cmd.params[3] += moveY;
    }
  }

  return convertPathCommandsToACLMZ(cmds);
}

/**
 * Convert L command to exact straight line C command (completely straight Bezier curve)
 * @param lCommand L command object
 * @param startPoint Starting point coordinates
 * @returns C command object representing exact straight line
 */
export function convertLineToExactCurveCommand(startPoint: Point, endPoint: Point): PathCommand {
  const endX = endPoint.x;
  const endY = endPoint.y;

  // For completely straight Bezier curve, control points must lie on line between start and end
  // Divide line into three equal segments, control points at each division point
  const cp1x = startPoint.x + (endX - startPoint.x) / 3;
  const cp1y = startPoint.y + (endY - startPoint.y) / 3;

  const cp2x = startPoint.x + (2 * (endX - startPoint.x)) / 3;
  const cp2y = startPoint.y + (2 * (endY - startPoint.y)) / 3;

  return {
    id: createId(),
    type: 'C',
    params: [cp1x, cp1y, cp2x, cp2y, endX, endY],
  };
}
