import type { Point, Material, VirtualBaseAttributes, CalcVirtualAttributesOptions } from '@idraw/types';
import { limitAngle } from '@idraw/util';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number; // Rotation angle around center, 0-360 degrees
  children?: Rect[];
}

/**
 * Calculate the center position of a child rectangle in world coordinates
 * @param targetRect The target child rectangle
 * @param parents Array of parent rectangles from direct parent to root (in hierarchical order)
 * @returns Center point coordinates in world coordinate system
 */
function calculateWorldPosition(targetRect: Rect, parents: Rect[]): Point {
  parents = [...parents].reverse();
  // If no parents, return the center point of target rectangle directly
  if (!parents || parents.length === 0) {
    return {
      x: targetRect.x + targetRect.width / 2,
      y: targetRect.y + targetRect.height / 2,
    };
  }

  // Calculate target rectangle's center in its own coordinate system
  let centerX = targetRect.x + targetRect.width / 2;
  let centerY = targetRect.y + targetRect.height / 2;

  // Apply transformations from direct parent to root
  // parents[0] is direct parent, parents[parents.length-1] is root
  for (let i = 0; i < parents.length; i++) {
    const parent = parents[i];

    // Transform the point through this parent's coordinate system
    const transformed = applyRectTransformation({ x: centerX, y: centerY }, parent);

    centerX = transformed.x;
    centerY = transformed.y;
  }

  return { x: centerX, y: centerY };
}

/**
 * Apply a rectangle's transformation to a point
 * @param point The point to transform (in the rectangle's local coordinates)
 * @param rect The rectangle defining the transformation
 * @returns The transformed point in the rectangle's parent coordinate system
 */
function applyRectTransformation(point: Point, rect: Rect): Point {
  // Step 1: Calculate rectangle's center
  const rectCenterX = rect.width / 2;
  const rectCenterY = rect.height / 2;

  // Step 2: Translate point to rectangle's center-oriented coordinate system
  const centeredX = point.x - rectCenterX;
  const centeredY = point.y - rectCenterY;

  // Step 3: Apply rotation (if any)
  let rotatedX = centeredX;
  let rotatedY = centeredY;

  if (typeof rect.angle === 'number' && rect.angle !== 0) {
    const angleRad = (rect.angle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    rotatedX = centeredX * cos - centeredY * sin;
    rotatedY = centeredX * sin + centeredY * cos;
  }

  // Step 4: Translate back to rectangle's local coordinate system
  const localX = rotatedX + rectCenterX;
  const localY = rotatedY + rectCenterY;

  // Step 5: Add rectangle's position in its parent's coordinate system
  const worldX = localX + rect.x;
  const worldY = localY + rect.y;

  return { x: worldX, y: worldY };
}

export function calcVirtualBaseAttributes(mtrl: Material, opts: CalcVirtualAttributesOptions): VirtualBaseAttributes {
  const { groupQueue = [] } = opts;
  // const center = calcMaterialCenter(mtrl);
  let worldAngle = mtrl.angle || 0;

  groupQueue.forEach((group) => {
    worldAngle += group.angle || 0;
  });
  const worldCenter = calculateWorldPosition(mtrl as any, groupQueue as any[]);

  const attributes: VirtualBaseAttributes = {
    worldCenter,
    worldAngle: limitAngle(worldAngle),
  };

  return attributes;
}
