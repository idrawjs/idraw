type TypePoint = {
  x: number;
  y: number;
}

type TypeBoardScrollConfig = {
  color: string,
  lineWidth: number
}

type TypeBoardSizeOptions = {
  width?: number;
  height?: number;
  contextWidth?: number;
  contextHeight?: number;
  devicePixelRatio?: number;
}

type TypeBoardOptions = TypeBoardSizeOptions & {
  width: number;
  height: number;
  contextWidth: number;
  contextHeight: number;
  canScroll?: boolean;
  scrollConfig?: TypeBoardScrollConfig
}

type TypePointCursor = 'auto' | 'move' | 'n-resize' | 'e-resize' | 's-resize' | 'w-resize'
| 'ne-resize' | 'nw-resize' | 'se-resize' | 'sw-resize' | 'grab';

export {
  TypePoint,
  TypePointCursor,
  TypeBoardSizeOptions,
  TypeBoardOptions,
  TypeBoardScrollConfig,
};