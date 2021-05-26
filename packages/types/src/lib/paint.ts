export type TypePaintData = {
  brushMap: {[name: string]: TypePaintBrush},
  paths: TypePaintPath[],
}

export type TypePaintBrush = {
  name: string;
  src: string;
}

export type TypePaintPath = {
  brush: string,
  size: number;
  positions: TypePaintPosition[],
  color: string;
  pressure: number;
}

export type TypePaintPosition = {
  x: number,
  y: number,
  t: number,
}
