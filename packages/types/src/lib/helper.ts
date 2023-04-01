import { IDrawData } from './data';
import { Point } from './board';

// type test = {[uuid string]: DataElement}

type HelperController = Point & {
  invisible?: boolean;
};

type HeplerSelectedElementWrapper = {
  uuid: string;
  controllerSize: number;
  controllerOffset: number;
  lock: boolean;
  controllers: {
    topLeft: HelperController;
    top: HelperController;
    topRight: HelperController;
    right: HelperController;
    bottomRight: HelperController;
    bottom: HelperController;
    bottomLeft: HelperController;
    left: HelperController;
    rotate: HelperController;
  };
  lineDash: number[];
  lineWidth: number;
  color: string;
  radian?: number;
  translate?: Point;
};

type HeplerSelectedAreaWrapper = {
  x: number;
  y: number;
  w: number;
  h: number;
  startPoint: Point;
  endPoint: Point;
  lineWidth: number;
  lineDash: number[];
  color: string;
};

type HelperConfig = {
  elementIndexMap: { [key: string]: number };
  selectedAreaWrapper?: HeplerSelectedAreaWrapper;
  selectedElementWrapper?: HeplerSelectedElementWrapper;
  selectedElementListWrappers?: Array<HeplerSelectedElementWrapper>;
};

type HelperUpdateOpts = {
  width: number;
  height: number;
  selectedUUID?: string | null;
  selectedUUIDList?: string[];
  devicePixelRatio: number;
  scale: number;
  canScroll: boolean;
  scrollX: number;
  scrollY: number;
};

interface Helper {
  updateConfig(data: IDrawData, opts: HelperUpdateOpts): void;
  getConfig(): HelperConfig;
}

type HelperWrapperControllerDirection =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left'
  | 'rotate';

export {
  Helper,
  HelperConfig,
  HelperUpdateOpts,
  HelperWrapperControllerDirection,
  HeplerSelectedElementWrapper,
  HeplerSelectedAreaWrapper
};
