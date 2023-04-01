export type PaintData = {
  brushMap: { [name: string]: PaintBrush };
  paths: PaintPath[];
};

export type PaintBrush = {
  name: string;
  src: string;
};

export type PaintPath = {
  brush: string;
  size: number;
  positions: PaintPosition[];
  color: string;
  pressure: number;
};

export type PaintPosition = {
  x: number;
  y: number;
  t: number;
};
