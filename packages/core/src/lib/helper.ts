import {
  TypeData, TypeHelper, TypeHelperConfig, TypeHelperUpdateOpts,
  TypeHelperWrapperDotDirection, TypeElement,
  TypeElemDesc, TypeContext, TypePoint, TypeConfigStrict,
  TypeHeplerSelectedElementWrapper,
} from '@idraw/types';
import Board from '@idraw/board';
import util from '@idraw/util';
import { parseAngleToRadian, calcElementCenter } from './calculate';
import { rotateContext, } from './transform';

const { deepClone } = util.data;

const areaLineWidth = 1.5;
const areaColor = '#2ab6f1';
const areaLineDash = [4, 3];

export class Helper implements TypeHelper {

  private _helperConfig: TypeHelperConfig;
  private _coreConfig: TypeConfigStrict;
  private _ctx: TypeContext;
  private _board: Board;
  private _areaStart: TypePoint = { x: 0, y: 0};
  private _areaEnd: TypePoint = { x: 0, y: 0};

  constructor(board: Board, config: TypeConfigStrict) {
    this._board = board;
    this._ctx = this._board.getContext();
    this._coreConfig = config;
    this._helperConfig = {
      elementIndexMap: {}
    };
  }

  updateConfig (
    data: TypeData,
    opts: TypeHelperUpdateOpts
  ): void {
    this._updateElementIndex(data);
    this._updateSelectedElementWrapper(data, opts);
    this._updateSelectedElementListWrapper(data, opts);
    this._updateDisplayContextScrollWrapper(data, opts);
  }

  getConfig(): TypeHelperConfig {
    return deepClone(this._helperConfig);
  }

  getElementIndexByUUID(uuid: string): number | null {
    const index = this._helperConfig.elementIndexMap[uuid];
    if (index >= 0) {
      return index;
    }
    return null;
  }

  isPointInElementWrapperDot(p: TypePoint): [string | null | undefined, TypeHelperWrapperDotDirection | null] {
    const ctx = this._ctx;
    const uuid = this._helperConfig?.selectedElementWrapper?.uuid;
    let direction: TypeHelperWrapperDotDirection | null = null;
    if (!this._helperConfig.selectedElementWrapper) {
      return [null, null];
    }
    const wrapper = this._helperConfig.selectedElementWrapper;
    const dots = [
      wrapper.dots.topLeft, wrapper.dots.top, wrapper.dots.topRight, wrapper.dots.right,
      wrapper.dots.bottomRight, wrapper.dots.bottom, wrapper.dots.bottomLeft, wrapper.dots.left,
      wrapper.dots.rotate,
    ];
    const directionNames: TypeHelperWrapperDotDirection[] = [
      'top-left', 'top', 'top-right', 'right',
      'bottom-right', 'bottom', 'bottom-left', 'left', 
      'rotate',
    ];
    rotateContext(ctx, wrapper.translate, wrapper.radian || 0, () => {
      for (let i = 0; i < dots.length; i ++) {
        const dot = dots[i];
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, wrapper.dotSize, 0, Math.PI * 2);
        ctx.closePath();
        if (ctx.isPointInPath(p.x, p.y)) {
          direction = directionNames[i];
        }
        if (direction) {
          break;
        }
      }
    });
    return [uuid, direction];
  }

  startSelectArea(p: TypePoint) {
    this._areaStart = p;
    this._areaEnd = p;
  }

  changeSelectArea(p: TypePoint) {
    this._areaEnd = p;
    this._calcSelectedArea();
  }

  clearSelectedArea() {
    this._areaStart = {x: 0, y: 0};
    this._areaEnd = {x: 0, y: 0};
    this._calcSelectedArea();
  }

  calcSelectedElements(data: TypeData) {
    const start = this._areaStart;
    const end = this._areaEnd;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);
    const uuids: string[] = [];
    const ctx = this._ctx;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    // ctx.rect(x, y, w, h);
    ctx.closePath();
    data.elements.forEach((elem) => {
      const centerX = elem.x + elem.w / 2;
      const centerY = elem.y + elem.h / 2;
      if (ctx.isPointInPath(centerX, centerY)) {
        uuids.push(elem.uuid);
      }
    });
    return uuids;
  }

  private _calcSelectedArea() {
    const start = this._areaStart;
    const end = this._areaEnd;

    const transform = this._ctx.getTransform();
    const { scale = 1, scrollX = 0, scrollY = 0 } = transform;

    this._helperConfig.selectedAreaWrapper = {
      x: (Math.min(start.x, end.x) - scrollX) / scale,
      y: (Math.min(start.y, end.y) - scrollY) / scale,
      w: Math.abs(end.x - start.x) / scale,
      h: Math.abs(end.y - start.y) / scale,
      startPoint: {x: start.x, y: start.y},
      endPoint: {x: end.x, y: end.y},
      lineWidth: areaLineWidth / scale,
      lineDash: areaLineDash.map((num) => {
        return num / scale
      }),
      color: areaColor,
    }
  }

  private _updateElementIndex(data: TypeData) {
    this._helperConfig.elementIndexMap = {};
    data.elements.forEach((elem: TypeElement<keyof TypeElemDesc>, i) => {
      this._helperConfig.elementIndexMap[elem.uuid] = i;
    });
  }

  private _updateSelectedElementWrapper(data: TypeData, opts: TypeHelperUpdateOpts) {
    const { selectedUUID: uuid } = opts;
    if (!(typeof uuid === 'string' && this._helperConfig.elementIndexMap[uuid] >= 0)) {
      delete this._helperConfig.selectedElementWrapper;
      return;
    }
    const index: number = this._helperConfig.elementIndexMap[uuid];
    const elem = data.elements[index];
    const wrapper = this._createSelectedElementWrapper(elem, opts);
    this._helperConfig.selectedElementWrapper = wrapper;
  }

  private _updateSelectedElementListWrapper(data: TypeData, opts: TypeHelperUpdateOpts) {
    const { selectedUUIDList } = opts;
    const wrapperList: TypeHeplerSelectedElementWrapper[] = [];
    data.elements.forEach((elem) => {
      if (selectedUUIDList?.includes(elem.uuid)) {
        const wrapper = this._createSelectedElementWrapper(elem, opts);
        wrapperList.push(wrapper);
      }
    });
    this._helperConfig.selectedElementListWrappers = wrapperList;
  }

  private _createSelectedElementWrapper(
    elem: TypeElement<keyof TypeElemDesc>,
    opts: TypeHelperUpdateOpts
  ): TypeHeplerSelectedElementWrapper {
    const { scale } = opts;
    const dotSize = this._coreConfig.elementWrapper.dotSize / scale;
    const lineWidth = this._coreConfig.elementWrapper.lineWidth / scale;
    const lineDash = this._coreConfig.elementWrapper.lineDash.map(n => (n / scale));
    const rotateLimit = 12;
    // @ts-ignore
    const bw = elem.desc?.borderWidth || 0;  
    
    const wrapper: TypeHeplerSelectedElementWrapper = {
      uuid: elem.uuid,
      dotSize: dotSize,
      dots: {
        topLeft: {
          x: elem.x - dotSize - bw,
          y: elem.y - dotSize - bw,
        },
        top: {
          x: elem.x + elem.w / 2,
          y: elem.y - dotSize - bw,
        },
        topRight: {
          x: elem.x + elem.w + dotSize + bw,
          y: elem.y - dotSize - bw,
        },
        right: {
          x: elem.x + elem.w + dotSize + bw,
          y: elem.y + elem.h / 2,
        },
        bottomRight: {
          x: elem.x + elem.w + dotSize + bw,
          y: elem.y + elem.h + dotSize + bw,
        },
        bottom: {
          x: elem.x + elem.w / 2,
          y: elem.y + elem.h + dotSize + bw,
        },
        bottomLeft: {
          x: elem.x - dotSize - bw,
          y: elem.y + elem.h + dotSize + bw,
        },
        left: {
          x: elem.x - dotSize - bw,
          y: elem.y + elem.h / 2,
        },
        rotate: {
          x: elem.x + elem.w / 2,
          y: elem.y - dotSize - (dotSize * 2 + rotateLimit) - bw,
        }
      },
      lineWidth: lineWidth,
      lineDash: lineDash,
      color: '#2ab6f1',
    };

    if (typeof elem.angle === 'number' && (elem.angle > 0 || elem.angle < 0)) {
      wrapper.radian = parseAngleToRadian(elem.angle);
      wrapper.translate = calcElementCenter(elem);
    }

    return wrapper;
  }

  private _updateDisplayContextScrollWrapper(data: TypeData, opts: TypeHelperUpdateOpts) {
    if (opts.canScroll !== true) {
      return;
    }
    const { width, height } = opts;
    const sliderMinSize = 50;
    const lineSize = 16;
    const { position } = this._board.getScreenInfo();
    let xSize = 0;
    let ySize = 0;
    if (position.left <= 0 || position.right <= 0) {
      xSize = Math.max(
        sliderMinSize, width - (
          Math.abs(position.left < 0 ? position.left : 0) + Math.abs(position.right < 0 ? position.right : 0)
        )
      );
      if (xSize >= width) xSize = 0;
    }
    if (position.top <= 0 || position.bottom <= 0) {
      ySize = Math.max(
        sliderMinSize, height - (
          Math.abs(position.top < 0 ? position.top : 0) + Math.abs(position.bottom < 0 ? position.bottom : 0)
        )
      );
      if (ySize >= height) ySize = 0;
    }

    let translateX = 0;
    if (xSize > 0) {
      translateX = width * Math.abs(position.left) / (Math.abs(position.left) + Math.abs(position.right));
      translateX = Math.min(Math.max(0, translateX - xSize / 2), width - xSize);
    }

    let translateY = 0;
    if (ySize > 0) {
      translateY = height * Math.abs(position.top) / (Math.abs(position.top) + Math.abs(position.bottom));
      translateY = Math.min(Math.max(0, translateY - ySize / 2), height - ySize);
    }
    this._helperConfig.displayContextScrollWrapper = {
      lineSize,
      xSize,
      ySize,
      translateY,
      translateX,
      color: '#e0e0e0'
    };
    
  }

  
}