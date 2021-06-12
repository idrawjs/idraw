import { TypeData } from './data';
import { TypePoint } from './board';

// type test = {[uuid string]: TypeElement}

type TypeHelperConfig = {
  elementIndexMap: {[key: string]: number},
  selectedElementWrapper?: {
    uuid: string;
    dotSize: number;
    dots: {
      topLeft: TypePoint,
      top: TypePoint,
      topRight: TypePoint,
      right: TypePoint,
      bottomRight: TypePoint,
      bottom: TypePoint,
      bottomLeft: TypePoint,
      left: TypePoint,
      rotate: TypePoint,
    },
    // limit: {
    //   minWidth: number;
    //   minHeight: number;
    // },
    lineDash: number[];
    lineWidth: number;
    color: string;
    radian?: number;
    translate?: TypePoint;
  },
  displayContextScrollWrapper?: {
    lineSize: number,
    xSize: number,
    ySize: number,
    translateY: number,
    translateX: number,
    color: string,
  }
}

type TypeHelperUpdateOpts = {
  width: number;
  height: number;
  selectedUUID?: string | null;
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
};