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

export {
  TypePoint,
  TypeBoardSizeOptions,
  TypeBoardOptions,
  TypeBoardScrollConfig,
};