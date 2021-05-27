import { TypeData } from './data';
import { TypePoint } from './board';

// type test = {[uuid string]: TypeElement}

type TypeHelperConfig = {
  elementIndexMap: {[key: string]: Number},
  selectedElementWrapper?: {
    size: number;
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

type TypeHelperCreateOpts = {
  selectedUUID?: string | null,
}

interface TypeHelper {
  updateConfig(
    data: TypeData,
    opts: TypeHelperCreateOpts
  ): void;
  getConfig(): TypeHelperConfig;
}

export {
  TypeHelper,
  TypeHelperConfig,
  TypeHelperCreateOpts,
}