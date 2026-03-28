import { PathCommand, Point, Context2DCommand, Context2DEllipseParams } from '@idraw/types';
import { parseSVGPath, createId } from '@idraw/util';

interface CubicBezier {
  c1: Point;
  c2: Point;
  end: Point;
}

const isRelative = (type: string) => type === type.toLowerCase();

type ParseFunc = (cmd: PathCommand) => void;

function getPoint(cmd: PathCommand, xIndex: number, yIndex: number, currentPoint: Point): Point {
  const { type, params = [] } = cmd;
  return {
    x: isRelative(type) ? currentPoint.x + params[xIndex] : params[xIndex],
    y: isRelative(type) ? currentPoint.y + params[yIndex] : params[yIndex],
  };
}

function lineToCubic(start: Point, end: Point): CubicBezier {
  // Convert a straight line to a cubic Bezier curve (with control points at 1/3 and 2/3 of the line segment)
  return {
    c1: {
      x: start.x + (end.x - start.x) / 3,
      y: start.y + (end.y - start.y) / 3,
    },
    c2: {
      x: start.x + (2 * (end.x - start.x)) / 3,
      y: start.y + (2 * (end.y - start.y)) / 3,
    },
    end: { ...end },
  };
}

function quadToCubic(p0: Point, cp: Point, p2: Point): CubicBezier {
  // Second Bessel to Third Bessel
  return {
    c1: {
      x: p0.x + (2 / 3) * (cp.x - p0.x),
      y: p0.y + (2 / 3) * (cp.y - p0.y),
    },
    c2: {
      x: p2.x + (2 / 3) * (cp.x - p2.x),
      y: p2.y + (2 / 3) * (cp.y - p2.y),
    },
    end: { ...p2 },
  };
}

function convertSvgArcToCanvasEllipse(
  start: Point,
  end: Point,
  rx: number,
  ry: number,
  xAxisRotation: number,
  largeArcFlag: number,
  sweepFlag: number
): Context2DEllipseParams {
  // Ensure that the radius is non negative
  rx = Math.abs(rx);
  ry = Math.abs(ry);

  // If the starting and ending points are the same, return directly (degradation situation)
  if (Math.abs(start.x - end.x) < 1e-6 && Math.abs(start.y - end.y) < 1e-6) {
    return {
      centerX: start.x,
      centerY: start.y,
      radiusX: rx,
      radiusY: ry,
      rotation: (xAxisRotation * Math.PI) / 180,
      startRadian: 0,
      endRadian: 0,
      anticlockwise: sweepFlag === 0,
    };
  }

  // If the radius is 0, it degenerates into a straight line
  if (rx < 1e-6 || ry < 1e-6) {
    return {
      centerX: (start.x + end.x) / 2,
      centerY: (start.y + end.y) / 2,
      radiusX: 0,
      radiusY: 0,
      rotation: 0,
      startRadian: 0,
      endRadian: 0,
      anticlockwise: false,
    };
  }

  // 1. Calculate rotation angle (radians)
  const phi = (xAxisRotation * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  // 2. Calculate midpoint
  const mid: Point = {
    x: (start.x - end.x) / 2,
    y: (start.y - end.y) / 2,
  };

  // 3. Rotation midpoint
  const x1p = cosPhi * mid.x + sinPhi * mid.y;
  const y1p = -sinPhi * mid.x + cosPhi * mid.y;

  // 4. Adjust radius
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const sqrtLambda = Math.sqrt(lambda);
    rx *= sqrtLambda;
    ry *= sqrtLambda;
  }

  // 5. Calculate the center coordinates (cx ', cy')
  const sign = largeArcFlag === sweepFlag ? -1 : 1;
  let factor = Math.sqrt(
    Math.abs(
      (rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p) / (rx * rx * y1p * y1p + ry * ry * x1p * x1p)
    )
  );

  if (isNaN(factor)) factor = 0;

  const cxp = (sign * factor * (rx * y1p)) / ry;
  const cyp = (sign * factor * (-ry * x1p)) / rx;

  // 6. Calculate the center of the circle (cx, cy)
  const cx = cosPhi * cxp - sinPhi * cyp + (start.x + end.x) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (start.y + end.y) / 2;

  // 7. Calculate the starting and ending angles
  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx;
  const vy = (-y1p - cyp) / ry;

  // Calculate the starting angle
  const theta = Math.atan2(uy, ux);

  // Calculate the angle difference
  let delta = Math.atan2(vy, vx) - theta;

  // Adjust the angle difference
  if (sweepFlag === 0 && delta > 0) {
    delta -= 2 * Math.PI;
  } else if (sweepFlag === 1 && delta < 0) {
    delta += 2 * Math.PI;
  }

  // 8. Return the final parameters
  return {
    centerX: cx,
    centerY: cy,
    radiusX: rx,
    radiusY: ry,
    rotation: phi,
    startRadian: theta,
    endRadian: theta + delta,
    anticlockwise: sweepFlag === 0,
  };
}

export function convertSVGPathToContext2DCommands(d: string): Context2DCommand[] {
  const svgPathCmds = parseSVGPath(d);
  const ctx2dCmds = convertPathCommandsToContext2DCommands(svgPathCmds);
  return ctx2dCmds;
}

export function convertPathCommandsToContext2DCommands(svgPathCmds: PathCommand[]): Context2DCommand[] {
  let currentPoint: Point = { x: 0, y: 0 };
  let startPoint: Point = { x: 0, y: 0 };
  let prevControlPoint: Point | null = null;
  const ctx2dCmds: Context2DCommand[] = [];
  const handleMove: ParseFunc = (cmd) => {
    const end = getPoint(cmd, 0, 1, currentPoint);
    currentPoint = { ...end };
    startPoint = { ...end };
    ctx2dCmds.push({
      id: createId(),
      name: 'moveTo',
      params: { x: end.x, y: end.y },
    });
    prevControlPoint = null;
  };

  const handleLine: ParseFunc = (cmd) => {
    const end = getPoint(cmd, 0, 1, currentPoint);
    const curve = lineToCubic(currentPoint, end);
    ctx2dCmds.push({
      id: createId(),
      name: 'bezierCurveTo',
      params: {
        cp1x: curve.c1.x,
        cp1y: curve.c1.y,
        cp2x: curve.c2.x,
        cp2y: curve.c2.y,
        x: curve.end.x,
        y: curve.end.y,
      },
    });
    currentPoint = { ...end };
    prevControlPoint = curve.c2;
  };

  const handleHorizontal: ParseFunc = (cmd) => {
    const x = isRelative(cmd.type) ? currentPoint.x + cmd.params[0] : cmd.params[0];
    const end = { x, y: currentPoint.y };
    const curve = lineToCubic(currentPoint, end);
    ctx2dCmds.push({
      id: createId(),
      name: 'bezierCurveTo',
      params: {
        cp1x: curve.c1.x,
        cp1y: curve.c1.y,
        cp2x: curve.c2.x,
        cp2y: curve.c2.y,
        x: curve.end.x,
        y: curve.end.y,
      },
    });
    currentPoint = { ...end };
    prevControlPoint = curve.c2;
  };

  const handleVertical: ParseFunc = (cmd) => {
    const y = isRelative(cmd.type) ? currentPoint.y + cmd.params[0] : cmd.params[0];
    const end = { x: currentPoint.x, y };
    const curve = lineToCubic(currentPoint, end);
    ctx2dCmds.push({
      id: createId(),
      name: 'bezierCurveTo',
      params: {
        cp1x: curve.c1.x,
        cp1y: curve.c1.y,
        cp2x: curve.c2.x,
        cp2y: curve.c2.y,
        x: curve.end.x,
        y: curve.end.y,
      },
    });
    currentPoint = { ...end };
    prevControlPoint = curve.c2;
  };

  const handleCubic: ParseFunc = (cmd) => {
    const c1 = getPoint(cmd, 0, 1, currentPoint);
    const c2 = getPoint(cmd, 2, 3, currentPoint);
    const end = getPoint(cmd, 4, 5, currentPoint);
    ctx2dCmds.push({
      id: createId(),
      name: 'bezierCurveTo',
      params: { cp1x: c1.x, cp1y: c1.y, cp2x: c2.x, cp2y: c2.y, x: end.x, y: end.y },
    });
    currentPoint = { ...end };
    prevControlPoint = c2;
  };

  const handleShortCubic: ParseFunc = (cmd) => {
    const prevC2 = prevControlPoint || currentPoint;
    const c1 = {
      x: 2 * currentPoint.x - prevC2.x,
      y: 2 * currentPoint.y - prevC2.y,
    };
    const c2 = getPoint(cmd, 0, 1, currentPoint);
    const end = getPoint(cmd, 2, 3, currentPoint);
    ctx2dCmds.push({
      id: createId(),
      name: 'bezierCurveTo',
      params: { cp1x: c1.x, cp1y: c1.y, cp2x: c2.x, cp2y: c2.y, x: end.x, y: end.y },
    });
    currentPoint = { ...end };
    prevControlPoint = c2;
  };

  const handleQuadratic: ParseFunc = (cmd) => {
    const cp = getPoint(cmd, 0, 1, currentPoint);
    const end = getPoint(cmd, 2, 3, currentPoint);
    const curve = quadToCubic(currentPoint, cp, end);
    ctx2dCmds.push({
      id: createId(),
      name: 'bezierCurveTo',
      params: {
        cp1x: curve.c1.x,
        cp1y: curve.c1.y,
        cp2x: curve.c2.x,
        cp2y: curve.c2.y,
        x: curve.end.x,
        y: curve.end.y,
      },
    });
    currentPoint = { ...end };
    prevControlPoint = curve.c2;
  };

  const handleShortQuadratic: ParseFunc = (cmd) => {
    const prevCP = prevControlPoint
      ? {
          x: 2 * currentPoint.x - prevControlPoint.x,
          y: 2 * currentPoint.y - prevControlPoint.y,
        }
      : currentPoint;

    const end = getPoint(cmd, 0, 1, currentPoint);
    const curve = quadToCubic(currentPoint, prevCP, end);
    ctx2dCmds.push({
      id: createId(),
      name: 'bezierCurveTo',
      params: {
        cp1x: curve.c1.x,
        cp1y: curve.c1.y,
        cp2x: curve.c2.x,
        cp2y: curve.c2.y,
        x: curve.end.x,
        y: curve.end.y,
      },
    });
    currentPoint = { ...end };
    prevControlPoint = curve.c2;
  };

  const handleArc: ParseFunc = (cmd) => {
    // Fix parameter parsing: 7 parameters for correctly handling arc commands
    const [rx, ry, rotationDeg, largeFlag, sweepFlag, x, y] = cmd.params;
    const end = {
      x: isRelative(cmd.type) ? currentPoint.x + x : x,
      y: isRelative(cmd.type) ? currentPoint.y + y : y,
    };

    const ellipseParams = convertSvgArcToCanvasEllipse(
      currentPoint,
      end,
      rx,
      ry,
      (rotationDeg * Math.PI) / 180,
      largeFlag,
      sweepFlag
    );

    ctx2dCmds.push({
      id: createId(),
      name: 'ellipse',
      params: ellipseParams,
    });

    currentPoint = { ...end };
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClose: ParseFunc = (cmd) => {
    if (currentPoint.x !== startPoint.x || currentPoint.y !== startPoint.y) {
      const curve = lineToCubic(currentPoint, startPoint);
      ctx2dCmds.push({
        id: createId(),
        name: 'bezierCurveTo',
        params: {
          cp1x: curve.c1.x,
          cp1y: curve.c1.y,
          cp2x: curve.c2.x,
          cp2y: curve.c2.y,
          x: curve.end.x,
          y: curve.end.y,
        },
      });
    }
    ctx2dCmds.push({
      id: createId(),
      name: 'closePath',
      params: null,
    });
    currentPoint = { ...startPoint };
    prevControlPoint = null;
  };

  ctx2dCmds.push({
    id: createId(),
    name: 'beginPath',
    params: null,
  });

  for (const command of svgPathCmds) {
    const { id, type, params = [] } = command;
    const cmd = { id, type, params };
    switch (cmd.type.toUpperCase()) {
      case 'M':
        handleMove(cmd);
        break;
      case 'L':
        handleLine(cmd);
        break;
      case 'H':
        handleHorizontal(cmd);
        break;
      case 'V':
        handleVertical(cmd);
        break;
      case 'C':
        handleCubic(cmd);
        break;
      case 'S':
        handleShortCubic(cmd);
        break;
      case 'Q':
        handleQuadratic(cmd);
        break;
      case 'T':
        handleShortQuadratic(cmd);
        break;
      case 'A':
        handleArc(cmd);
        break;
      case 'Z':
        handleClose(cmd);
        break;
    }
  }

  return ctx2dCmds;
}

function convertCanvasEllipseToSvgArc(ellipseParams: Context2DEllipseParams) {
  const { centerX, centerY, radiusX, radiusY, rotation, startRadian, endRadian, anticlockwise } = ellipseParams;

  // Calculate the coordinates of the starting and ending points
  // const startPoint = calculatePointOnEllipse(centerX, centerY, radiusX, radiusY, rotation, startRadian);
  const endPoint = calculatePointOnEllipse(centerX, centerY, radiusX, radiusY, rotation, endRadian);

  // Calculate sweep angle
  let sweepAngle = endRadian - startRadian;

  // Handle counterclockwise direction
  if (anticlockwise) {
    if (sweepAngle > 0) {
      sweepAngle -= 2 * Math.PI;
    }
  } else {
    if (sweepAngle < 0) {
      sweepAngle += 2 * Math.PI;
    }
  }

  // Determine the large arc mark
  const largeArcFlag = Math.abs(sweepAngle) > Math.PI ? 1 : 0;

  // Determine the scanning direction marker
  const sweepFlag = anticlockwise ? 0 : 1;

  return {
    rx: radiusX,
    ry: radiusY,
    xAxisRotation: (rotation * 180) / Math.PI,
    largeArcFlag,
    sweepFlag,
    endPoint,
  };
}

function calculatePointOnEllipse(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  rotation: number,
  radian: number
): Point {
  const cosPhi = Math.cos(rotation);
  const sinPhi = Math.sin(rotation);

  const x = centerX + radiusX * Math.cos(radian) * cosPhi - radiusY * Math.sin(radian) * sinPhi;
  const y = centerY + radiusX * Math.cos(radian) * sinPhi + radiusY * Math.sin(radian) * cosPhi;

  return { x, y };
}

export function convertContext2DCommandsToSVGPath(cmds: Context2DCommand[]): string {
  const paths: string[] = [];
  cmds.forEach((cmd) => {
    if (cmd.name === 'moveTo') {
      paths.push(`M ${cmd.params.x}, ${cmd.params.y}`);
    } else if (cmd.name === 'bezierCurveTo') {
      paths.push(
        `C ${cmd.params.cp1x},${cmd.params.cp1y} ${cmd.params.cp2x},${cmd.params.cp2y} ${cmd.params.x},${cmd.params.y}`
      );
    } else if (cmd.name === 'ellipse') {
      const arcParams = convertCanvasEllipseToSvgArc(cmd.params);
      const { rx, ry, xAxisRotation, largeArcFlag, sweepFlag, endPoint } = arcParams;
      paths.push(`A ${rx} ${ry} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${endPoint.x} ${endPoint.y}`);
    } else if (cmd.name === 'beginPath') {
      paths.push('');
    } else if (cmd.name === 'closePath') {
      paths.push('Z');
    }
  });
  return paths.join(' ');
}
