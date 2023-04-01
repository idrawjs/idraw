type Point = {
  x: number;
  y: number;
};

type BoardScrollConfig = {
  color: string;
  width: number;
  showBackground?: boolean;
};

type BoardSizeOptions = {
  width?: number;
  height?: number;
  contextWidth?: number;
  contextHeight?: number;
  devicePixelRatio?: number;
};

type BoardOptions = BoardSizeOptions & {
  width: number;
  height: number;
  contextWidth: number;
  contextHeight: number;
  canScroll?: boolean;
  scrollConfig?: BoardScrollConfig;
};

type PointCursor =
  | 'auto'
  | 'move'
  | 'n-resize'
  | 'e-resize'
  | 's-resize'
  | 'w-resize'
  | 'ne-resize'
  | 'nw-resize'
  | 'se-resize'
  | 'sw-resize'
  | 'grab';

export {
  Point,
  PointCursor,
  BoardSizeOptions,
  BoardOptions,
  BoardScrollConfig
};
