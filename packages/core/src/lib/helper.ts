import {
  TypeData, TypeHelper, TypeHelperConfig, TypeHelperUpdateOpts,
  TypeHelperWrapperDotDirection, TypeElement,
  TypeElemDesc, TypeContext, TypePoint, TypeConfigStrict,
  TypeHeplerSelectedElementWrapper
} from '@idraw/types';
import Board from '@idraw/board';
import util from '@idraw/util';
import { parseAngleToRadian, calcElementCenter } from './calculate';
import { rotateContext, rotateElement } from './transform';

const { deepClone } = util.data;

export class Helper implements TypeHelper {

  private _helperConfig: TypeHelperConfig;
  private _coreConfig: TypeConfigStrict;
  private _ctx: TypeContext;
  private _board: Board;
  private _areaStart: TypePoint = { x: 0, y: 0 };
  private _areaEnd: TypePoint = { x: 0, y: 0 };

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

  isPointInElementWrapperDot(p: TypePoint): 
    [ 
      string | null | undefined, 
      TypeHelperWrapperDotDirection | null,
      number | null,
  ] {
    const ctx = this._ctx;
    const uuid = this._helperConfig?.selectedElementWrapper?.uuid || null;
    let directIdx = null;
    let direction: TypeHelperWrapperDotDirection | null = null;
    if (!this._helperConfig.selectedElementWrapper) {
      return [uuid, direction, directIdx];
    }
    const wrapper = this._helperConfig.selectedElementWrapper;
    const dots = [
      wrapper.dots.topLeft, wrapper.dots.top, wrapper.dots.topRight, wrapper.dots.right,
      wrapper.dots.bottomRight, wrapper.dots.bottom, wrapper.dots.bottomLeft, wrapper.dots.left,
    ];
    const directionNames: TypeHelperWrapperDotDirection[] = [
      'right',
      'top-right',
      'top',
      'top-left',
      'left', 
      'bottom-left',
      'bottom',
      'bottom-right',
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
          directIdx = i;
          break;
        }
      }
    });
    if (direction === null) {
      rotateContext(ctx, wrapper.translate, wrapper.radian || 0, () => {
        const dot = wrapper.dots.rotate;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, wrapper.dotSize, 0, Math.PI * 2);
        ctx.closePath();
        if (ctx.isPointInPath(p.x, p.y)) {
          direction = 'rotate';
        }
      });
    }
    return [uuid, direction, directIdx];
  }

  isPointInElementList(p: TypePoint, data: TypeData): boolean {
    const ctx = this._ctx;
    let idx = -1;
    let uuid = null;
    const wrapperList = this._helperConfig?.selectedElementListWrappers || [];
    for (let i = 0; i < wrapperList.length; i++) {
      const wrapper = wrapperList[i];
      const elemIdx = this._helperConfig.elementIndexMap[wrapper.uuid];
      const ele = data.elements[elemIdx];
      if (!ele) continue;
      let bw = 0;
      // @ts-ignore
      if (ele.desc?.borderWidth > 0) {
        // @ts-ignore
        bw = ele.desc.borderWidth;
      }
      rotateElement(ctx, ele, () => {
        ctx.beginPath();
        ctx.moveTo(ele.x - bw, ele.y - bw);
        ctx.lineTo(ele.x + ele.w + bw, ele.y - bw);
        ctx.lineTo(ele.x + ele.w + bw, ele.y + ele.h + bw);
        ctx.lineTo(ele.x - bw, ele.y + ele.h + bw);
        ctx.lineTo(ele.x, ele.y);

        ctx.rect(ele.x, ele.y, ele.w, ele.h);
        ctx.closePath();
        if (ctx.isPointInPath(p.x, p.y)) {
          idx = i;
          uuid = ele.uuid;
        }
      });
      if (idx >= 0) {
        break;
      }
    }
    if (uuid && idx >= 0) {
      return true;
    } else {
      return false;
    }
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
    const transform = this._ctx.getTransform();
    const { scale = 1, scrollX = 0, scrollY = 0 } = transform;
    const start = this._areaStart;
    const end = this._areaEnd;
    const x = (Math.min(start.x, end.x) - scrollX) / scale;
    const y = (Math.min(start.y, end.y) - scrollY) / scale;
    const w = Math.abs(end.x - start.x) / scale;
    const h = Math.abs(end.y - start.y) / scale;
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
      if (elem?.operation?.invisible !== true) {
        const centerX = elem.x + elem.w / 2;
        const centerY = elem.y + elem.h / 2;
        if (ctx.isPointInPathWithoutScroll(centerX, centerY)) {
          uuids.push(elem.uuid);
        }
      }
    });
    return uuids;
  }

  private _calcSelectedArea() {
    const start = this._areaStart;
    const end = this._areaEnd;

    const transform = this._ctx.getTransform();
    const { scale = 1, scrollX = 0, scrollY = 0 } = transform;
    const elemWrapper = this._coreConfig.elementWrapper;
    const lineWidth = elemWrapper.lineWidth / scale;
    const lineDash = elemWrapper.lineDash.map(n => (n / scale));

    
    this._helperConfig.selectedAreaWrapper = {
      x: (Math.min(start.x, end.x) - scrollX) / scale,
      y: (Math.min(start.y, end.y) - scrollY) / scale,
      w: Math.abs(end.x - start.x) / scale,
      h: Math.abs(end.y - start.y) / scale,
      startPoint: {x: start.x, y: start.y},
      endPoint: {x: end.x, y: end.y},
      lineWidth: lineWidth,
      lineDash: lineDash,
      color: elemWrapper.color,
    };
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
    if (elem?.operation?.invisible === true) {
      return;
    }
    const wrapper = this._createSelectedElementWrapper(elem, opts);
    this._helperConfig.selectedElementWrapper = wrapper;
  }

  private _updateSelectedElementListWrapper(data: TypeData, opts: TypeHelperUpdateOpts) {
    const { selectedUUIDList } = opts;
    const wrapperList: TypeHeplerSelectedElementWrapper[] = [];
    data.elements.forEach((elem, i) => {
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
    const elemWrapper = this._coreConfig.elementWrapper;
    const dotSize = elemWrapper.dotSize / scale;
    const lineWidth = elemWrapper.lineWidth / scale;
    const lineDash = elemWrapper.lineDash.map(n => (n / scale));

    const rotateLimit = 12;
    // @ts-ignore
    const bw = elem.desc?.borderWidth || 0;  
    
    const wrapper: TypeHeplerSelectedElementWrapper = {
      uuid: elem.uuid,
      dotSize: dotSize,
      lock: elem?.operation?.lock === true,
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
      color: elem?.operation?.lock === true ? elemWrapper.lockColor : elemWrapper.color,
    };

    if (typeof elem.angle === 'number' && (elem.angle > 0 || elem.angle < 0)) {
      wrapper.radian = parseAngleToRadian(elem.angle);
      wrapper.translate = calcElementCenter(elem);
    }

    return wrapper;
  }
  
}