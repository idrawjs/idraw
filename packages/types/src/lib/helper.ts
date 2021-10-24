import { TypeData } from './data';
import { TypePoint } from './board';

// type test = {[uuid string]: TypeElement}

type TypeController =  TypePoint & {
  invisible?: boolean;
};

type TypeHeplerSelectedElementWrapper = {
  uuid: string;
  controllerSize: number;
  lock: boolean;
  controllers: {
    topLeft: TypeController,
    top: TypeController,
    topRight: TypeController,
    right: TypeController,
    bottomRight: TypeController,
    bottom: TypeController,
    bottomLeft: TypeController,
    left: TypeController,
    rotate: TypeController,
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

type TypeHelperWrapperControllerDirection 
= 'top-left' | 'top' | 'top-right' | 'right'
| 'bottom-right' | 'bottom' | 'bottom-left' | 'left'
| 'rotate';

export {
  TypeHelper,
  TypeHelperConfig,
  TypeHelperUpdateOpts,
  TypeHelperWrapperControllerDirection,
  TypeHeplerSelectedElementWrapper,
  TypeHeplerSelectedAreaWrapper,
};