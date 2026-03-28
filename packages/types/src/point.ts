export interface Point {
  x: number;
  y: number;
}

export type ActionPoint = Point & {
  t: number;
};
