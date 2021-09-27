import { TypeData } from './data';
import { TypePoint } from './board';

// type test = {[uuid string]: TypeElement}

type TypeDot =  TypePoint & {
  invisible?: boolean;
};

type TypeHeplerSelectedElementWrapper = {
  uuid: string;
  dotSize: number;
  lock: boolean;
  dots: {
    topLeft: TypeDot,
    top: TypeDot,
    topRight: TypeDot,
    right: TypeDot,
    bottomRight: TypeDot,
    bottom: TypeDot,
    bottomLeft: TypeDot,
    left: TypeDot,
    rotate: TypeDot,
  },
  lineDash: number[];
  lineWidth: number;
  color: string;
  radian?: number;
  translate?: TypePoint;
}

type TypeHeplerSelectedAreaWrapper = {
  x: number;
  y: number;
  w: number;
  h: number;
  startPoint: TypePoint;
  endPoint: TypePoint;
  lineWidth: number;
  lineDash: number[];
  color: string;
}

type TypeHelperConfig = {
  elementIndexMap: {[key: string]: number},
  selectedAreaWrapper?: TypeHeplerSelectedAreaWrapper;
  selectedElementWrapper?: TypeHeplerSelectedElementWrapper,
  selectedElementListWrappers?: Array<TypeHeplerSelectedElementWrapper>;
}


type TypeHelperUpdateOpts = {
  width: number;
  height: number;
  selectedUUID?: string | null;
  selectedUUIDList?: string[];
  devicePixelRatio: number;
  scale: number;
  canScroll: boolean;
  scrollX: number;
  scrollY: number;
}

interface TypeHelper {
  updateConfig(
    data: TypeData,
    opts: TypeHelperUpdateOpts
  ): void;
  getConfig(): TypeHelperConfig;
}

type TypeHelperWrapperDotDirection 
= 'top-left' | 'top' | 'top-right' | 'right'
| 'bottom-right' | 'bottom' | 'bottom-left' | 'left'
| 'rotate';

export {
  TypeHelper,
  TypeHelperConfig,
  TypeHelperUpdateOpts,
  TypeHelperWrapperDotDirection,
  TypeHeplerSelectedElementWrapper,
  TypeHeplerSelectedAreaWrapper,
};