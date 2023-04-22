export interface PointSize {
  x: number;
  y: number;
}
export interface Point extends PointSize {
  t: number;
}

export interface TouchPoint extends Point {
  f: number; // force, pressure
}
