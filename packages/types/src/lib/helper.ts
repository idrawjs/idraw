import { TypeData } from './data';
import { TypePoint } from './board';

// type test = {[uuid string]: TypeElement}

type TypeHelperConfig = {
  elementIndexMap: {[key: string]: number},
  selectedElementWrapper?: {
    uuid: string;
    dotSize: number;
    lineDash: number[];
    lineWidth: number;
    color: string;
    topLeft: TypePoint,
    top: TypePoint,
    topRight: TypePoint,
    right: TypePoint,
    bottomRight: TypePoint,
    bottom: TypePoint,
    bottomLeft: TypePoint,
    left: TypePoint,
  }
}

type TypeHelperUpdateOpts = {
  selectedUUID?: string | null;
  devicePixelRatio: number;
  scale: number;
}

interface TypeHelper {
  updateConfig(
    data: TypeData,
    opts: TypeHelperUpdateOpts
  ): void;
  getConfig(): TypeHelperConfig;
}

type TypeHelperWrapperDotPosition 
= 'top-left' | 'top' | 'top-right' | 'right'
| 'bottom-right' | 'bottom' | 'bottom-left' | 'left';

export {
  TypeHelper,
  TypeHelperConfig,
  TypeHelperUpdateOpts,
  TypeHelperWrapperDotPosition,
}