import type { Point } from '@idraw/types';

/**
 * Represents the bounding box of an SVG path
 */
export interface BoundingBox {
  minX: number; // Minimum X coordinate (left edge)
  minY: number; // Minimum Y coordinate (top edge)
  maxX: number; // Maximum X coordinate (right edge)
  maxY: number; // Maximum Y coordinate (bottom edge)
  width: number; // Width of the bounding box
  height: number; // Height of the bounding box
  start: Point; // Top-left corner of the bounding box
  end: Point; // Bottom-right corner of the bounding box
}

export type BoundingInfo = {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
  top: Point;
  right: Point;
  bottom: Point;
  left: Point;
  center: Point;
};
