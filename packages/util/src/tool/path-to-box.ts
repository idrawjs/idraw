import type { Point, BoundingBox, PathCommand } from '@idraw/types';
import { parseSVGPath } from './svg-path';

/**
 * Calculates the bounding box of an SVG path
 * @param commands - PathCommand[]
 * @returns Bounding box object with start and end points
 */
export function calcPathCommondsBoundingBox(commands: PathCommand[]): BoundingBox {
  // Initialize bounding box with extreme values
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // Current point in the path
  let currentPoint: Point = { x: 0, y: 0 };
  // Starting point of the current path segment
  let startPoint: Point = { x: 0, y: 0 };
  // Last control point for smooth curve commands
  let lastControlPoint: Point | null = null;

  /**
   * Updates the bounding box with a new point
   * @param point - Point to consider for bounding box calculation
   */
  const updateBBox = (point: Point) => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  };

  // Process each command in the path
  for (const cmd of commands) {
    const { type, params } = cmd;
    const isRelative = type === type.toLowerCase();

    switch (type.toLowerCase()) {
      case 'm': // Move to command
        if (params.length >= 2) {
          for (let i = 0; i < params.length; i += 2) {
            let x = params[i];
            let y = params[i + 1];

            if (isRelative) {
              x += currentPoint.x;
              y += currentPoint.y;
            }

            // First M command sets the start point
            if (i === 0) {
              startPoint = { x, y };
            }

            currentPoint = { x, y };
            updateBBox(currentPoint);
          }
        }
        lastControlPoint = null;
        break;

      case 'l': // Line to command
        if (params.length >= 2) {
          for (let i = 0; i < params.length; i += 2) {
            let x = params[i];
            let y = params[i + 1];

            if (isRelative) {
              x += currentPoint.x;
              y += currentPoint.y;
            }

            currentPoint = { x, y };
            updateBBox(currentPoint);
          }
        }
        lastControlPoint = null;
        break;

      case 'h': // Horizontal line command
        for (let i = 0; i < params.length; i++) {
          let x = params[i];

          if (isRelative) {
            x += currentPoint.x;
          }

          currentPoint = { x, y: currentPoint.y };
          updateBBox(currentPoint);
        }
        lastControlPoint = null;
        break;

      case 'v': // Vertical line command
        for (let i = 0; i < params.length; i++) {
          let y = params[i];

          if (isRelative) {
            y += currentPoint.y;
          }

          currentPoint = { x: currentPoint.x, y };
          updateBBox(currentPoint);
        }
        lastControlPoint = null;
        break;

      case 'c': // Cubic Bézier curve command
        if (params.length >= 6) {
          for (let i = 0; i < params.length; i += 6) {
            let cp1x = params[i];
            let cp1y = params[i + 1];
            let cp2x = params[i + 2];
            let cp2y = params[i + 3];
            let x = params[i + 4];
            let y = params[i + 5];

            if (isRelative) {
              cp1x += currentPoint.x;
              cp1y += currentPoint.y;
              cp2x += currentPoint.x;
              cp2y += currentPoint.y;
              x += currentPoint.x;
              y += currentPoint.y;
            }

            // Update control point for smooth curves
            lastControlPoint = { x: cp2x, y: cp2y };

            // Calculate curve extrema
            const curvePoints = getCubicBezierExtremes(currentPoint.x, currentPoint.y, cp1x, cp1y, cp2x, cp2y, x, y);

            // Update bounding box with curve points
            curvePoints.forEach(updateBBox);
            updateBBox({ x, y });

            currentPoint = { x, y };
          }
        }
        break;

      case 's': // Smooth cubic Bézier curve command
        if (params.length >= 4) {
          for (let i = 0; i < params.length; i += 4) {
            let cp2x = params[i];
            let cp2y = params[i + 1];
            let x = params[i + 2];
            let y = params[i + 3];

            // Calculate first control point (reflection)
            const cp1x: number = lastControlPoint ? 2 * currentPoint.x - lastControlPoint.x : currentPoint.x;
            const cp1y: number = lastControlPoint ? 2 * currentPoint.y - lastControlPoint.y : currentPoint.y;

            if (isRelative) {
              cp2x += currentPoint.x;
              cp2y += currentPoint.y;
              x += currentPoint.x;
              y += currentPoint.y;
            }

            // Update control point
            lastControlPoint = { x: cp2x, y: cp2y };

            // Calculate curve extrema
            const curvePoints = getCubicBezierExtremes(currentPoint.x, currentPoint.y, cp1x, cp1y, cp2x, cp2y, x, y);

            // Update bounding box with curve points
            curvePoints.forEach(updateBBox);
            updateBBox({ x, y });

            currentPoint = { x, y };
          }
        }
        break;

      case 'q': // Quadratic Bézier curve command
        if (params.length >= 4) {
          for (let i = 0; i < params.length; i += 4) {
            let cpx = params[i];
            let cpy = params[i + 1];
            let x = params[i + 2];
            let y = params[i + 3];

            if (isRelative) {
              cpx += currentPoint.x;
              cpy += currentPoint.y;
              x += currentPoint.x;
              y += currentPoint.y;
            }

            // Update control point
            lastControlPoint = { x: cpx, y: cpy };

            // Calculate curve extrema
            const curvePoints = getQuadraticBezierExtremes(currentPoint.x, currentPoint.y, cpx, cpy, x, y);

            // Update bounding box with curve points
            curvePoints.forEach(updateBBox);
            updateBBox({ x, y });

            currentPoint = { x, y };
          }
        }
        break;

      case 't': // Smooth quadratic Bézier curve command
        if (params.length >= 2) {
          for (let i = 0; i < params.length; i += 2) {
            let x = params[i];
            let y = params[i + 1];

            // Calculate control point (reflection)
            const cpx: number = lastControlPoint ? 2 * currentPoint.x - lastControlPoint.x : currentPoint.x;
            const cpy: number = lastControlPoint ? 2 * currentPoint.y - lastControlPoint.y : currentPoint.y;

            if (isRelative) {
              x += currentPoint.x;
              y += currentPoint.y;
            }

            // Update control point
            lastControlPoint = { x: cpx, y: cpy };

            // Calculate curve extrema
            const curvePoints = getQuadraticBezierExtremes(currentPoint.x, currentPoint.y, cpx, cpy, x, y);

            // Update bounding box with curve points
            curvePoints.forEach(updateBBox);
            updateBBox({ x, y });

            currentPoint = { x, y };
          }
        }
        break;

      case 'a': // Elliptical arc command (FIXED IMPLEMENTATION)
        if (params.length >= 7) {
          for (let i = 0; i < params.length; i += 7) {
            const rx = Math.abs(params[i]);
            const ry = Math.abs(params[i + 1]);
            const xAxisRotation = params[i + 2];
            const largeArcFlag = params[i + 3];
            const sweepFlag = params[i + 4];
            let x = params[i + 5];
            let y = params[i + 6];

            if (isRelative) {
              x += currentPoint.x;
              y += currentPoint.y;
            }

            // Calculate arc points
            const arcPoints = getArcPoints(
              currentPoint.x,
              currentPoint.y,
              rx,
              ry,
              xAxisRotation,
              largeArcFlag,
              sweepFlag,
              x,
              y
            );

            // Update bounding box with arc points
            arcPoints.forEach(updateBBox);

            currentPoint = { x, y };
            lastControlPoint = null;
          }
        }
        break;

      case 'z': // Close path command
        currentPoint = { ...startPoint };
        updateBBox(currentPoint);
        lastControlPoint = null;
        break;
    }
  }

  // Handle empty path case
  if (minX === Infinity) {
    minX = minY = maxX = maxY = 0;
  }

  const width = maxX - minX;
  const height = maxY - minY;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    start: { x: minX, y: minY },
    end: { x: maxX, y: maxY },
  };
}

/**
 * Calculates the bounding box of an SVG path
 * @param pathData - SVG path string (d attribute)
 * @returns Bounding box object with start and end points
 */
export function calcSVGPathBoundingBox(pathData: string): BoundingBox {
  // Split path into individual commands
  const commands = parseSVGPath(pathData);

  return calcPathCommondsBoundingBox(commands);
}

/**
 * Calculates extrema points for a cubic Bézier curve
 */
function getCubicBezierExtremes(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number
): Point[] {
  const points: Point[] = [];

  // Include start and end points
  points.push({ x: x0, y: y0 });
  points.push({ x: x3, y: y3 });

  // Calculate extrema in X direction
  const a = 3 * (-x0 + 3 * x1 - 3 * x2 + x3);
  const b = 6 * (x0 - 2 * x1 + x2);
  const c = 3 * (x1 - x0);

  const tValuesX = solveQuadratic(a, b, c);
  for (const t of tValuesX) {
    if (t > 0 && t < 1) {
      const x = cubicBezierValue(t, x0, x1, x2, x3);
      const y = cubicBezierValue(t, y0, y1, y2, y3);
      points.push({ x, y });
    }
  }

  // Calculate extrema in Y direction
  const d = 3 * (-y0 + 3 * y1 - 3 * y2 + y3);
  const e = 6 * (y0 - 2 * y1 + y2);
  const f = 3 * (y1 - y0);

  const tValuesY = solveQuadratic(d, e, f);
  for (const t of tValuesY) {
    if (t > 0 && t < 1) {
      const x = cubicBezierValue(t, x0, x1, x2, x3);
      const y = cubicBezierValue(t, y0, y1, y2, y3);
      points.push({ x, y });
    }
  }

  return points;
}

/**
 * Calculates extrema points for a quadratic Bézier curve
 */
function getQuadraticBezierExtremes(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): Point[] {
  const points: Point[] = [];

  // Include start and end points
  points.push({ x: x0, y: y0 });
  points.push({ x: x2, y: y2 });

  // Calculate extrema in X direction
  const a = x0 - 2 * x1 + x2;
  const b = 2 * (x1 - x0);

  if (a !== 0) {
    const t = -b / (2 * a);
    if (t > 0 && t < 1) {
      const x = quadraticBezierValue(t, x0, x1, x2);
      const y = quadraticBezierValue(t, y0, y1, y2);
      points.push({ x, y });
    }
  }

  // Calculate extrema in Y direction
  const c = y0 - 2 * y1 + y2;
  const d = 2 * (y1 - y0);

  if (c !== 0) {
    const t = -d / (2 * c);
    if (t > 0 && t < 1) {
      const x = quadraticBezierValue(t, x0, x1, x2);
      const y = quadraticBezierValue(t, y0, y1, y2);
      points.push({ x, y });
    }
  }

  return points;
}

/**
 * Calculates points along an elliptical arc (FIXED IMPLEMENTATION)
 * This implementation properly handles partial arcs like semicircles
 */
function getArcPoints(
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  xAxisRotation: number,
  largeArcFlag: number,
  sweepFlag: number,
  x2: number,
  y2: number
): Point[] {
  const points: Point[] = [];
  const numSegments = 100; // Number of segments for arc approximation

  // Convert rotation to radians
  const phi = (xAxisRotation * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  // Calculate midpoint in original coordinate system
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Transform to unrotated coordinate system
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  // Adjust radii if needed
  let rxAdjusted = rx;
  let ryAdjusted = ry;

  const rxSq = rx * rx;
  const rySq = ry * ry;
  const x1pSq = x1p * x1p;
  const y1pSq = y1p * y1p;

  // Ensure radii are large enough
  const lambda = x1pSq / rxSq + y1pSq / rySq;
  if (lambda > 1) {
    rxAdjusted = Math.sqrt(lambda) * rx;
    ryAdjusted = Math.sqrt(lambda) * ry;
  }

  // Calculate center point in transformed coordinate system
  const sign = largeArcFlag === sweepFlag ? -1 : 1;
  const num = Math.max(
    0,
    rxAdjusted * rxAdjusted * ryAdjusted * ryAdjusted -
      rxAdjusted * rxAdjusted * y1pSq -
      ryAdjusted * ryAdjusted * x1pSq
  );

  const denom = rxAdjusted * rxAdjusted * y1pSq + ryAdjusted * ryAdjusted * x1pSq;

  let factor = sign * Math.sqrt(num / denom);
  if (isNaN(factor)) factor = 0; // Handle case when radii are too small

  const cxp = factor * ((rxAdjusted * y1p) / ryAdjusted);
  const cyp = factor * ((-ryAdjusted * x1p) / rxAdjusted);

  // Transform center back to original coordinate system
  const cx = cosPhi * cxp - sinPhi * cyp + midX;
  const cy = sinPhi * cxp + cosPhi * cyp + midY;

  // Calculate start and end angles
  const startAngle = Math.atan2((y1p - cyp) / ryAdjusted, (x1p - cxp) / rxAdjusted);

  const endAngle = Math.atan2((-y1p - cyp) / ryAdjusted, (-x1p - cxp) / rxAdjusted);

  // Calculate angular sweep
  let sweepAngle = endAngle - startAngle;

  if (sweepFlag === 0 && sweepAngle > 0) {
    sweepAngle -= 2 * Math.PI;
  } else if (sweepFlag === 1 && sweepAngle < 0) {
    sweepAngle += 2 * Math.PI;
  }

  // Add points along the arc
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const angle = startAngle + t * sweepAngle;

    const x = cx + rxAdjusted * Math.cos(angle) * cosPhi - ryAdjusted * Math.sin(angle) * sinPhi;
    const y = cy + rxAdjusted * Math.cos(angle) * sinPhi + ryAdjusted * Math.sin(angle) * cosPhi;

    points.push({ x, y });
  }

  return points;
}

/**
 * Solves quadratic equation ax² + bx + c = 0
 * @returns Real roots in the range [0, 1]
 */
function solveQuadratic(a: number, b: number, c: number): number[] {
  const solutions: number[] = [];

  // Linear equation case
  if (a === 0) {
    if (b !== 0) {
      const solution = -c / b;
      if (solution >= 0 && solution <= 1) {
        solutions.push(solution);
      }
    }
    return solutions;
  }

  // Quadratic equation case
  const discriminant = b * b - 4 * a * c;

  if (discriminant > 0) {
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const solution1 = (-b + sqrtDiscriminant) / (2 * a);
    const solution2 = (-b - sqrtDiscriminant) / (2 * a);

    if (solution1 >= 0 && solution1 <= 1) solutions.push(solution1);
    if (solution2 >= 0 && solution2 <= 1) solutions.push(solution2);
  } else if (discriminant === 0) {
    const solution = -b / (2 * a);
    if (solution >= 0 && solution <= 1) solutions.push(solution);
  }

  return solutions;
}

/**
 * Calculates value on a cubic Bézier curve at parameter t
 */
function cubicBezierValue(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

/**
 * Calculates value on a quadratic Bézier curve at parameter t
 */
function quadraticBezierValue(t: number, p0: number, p1: number, p2: number): number {
  const mt = 1 - t;
  return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
}
