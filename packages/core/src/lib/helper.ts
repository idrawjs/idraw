import {
  TypeData,
  TypeHelper,
  TypeHelperConfig,
  TypeHelperUpdateOpts,
  TypeHelperWrapperDotDirection,
  TypeElement,
  TypeElemDesc,
  TypeContext,
  TypePoint,
  TypeConfigStrict,
} from '@idraw/types';

export class Helper implements TypeHelper {

  private _helperConfig: TypeHelperConfig;
  private _coreConfig: TypeConfigStrict;
  private _ctx: TypeContext;
  // private _helperConfig: TypeConfig;

  constructor(ctx: TypeContext, config: TypeConfigStrict) {
    this._ctx = ctx;
    this._coreConfig = config;
    this._helperConfig = {
      elementIndexMap: {}
    };
  }

  updateConfig (
    data: TypeData,
    opts: TypeHelperUpdateOpts ) {
    this._updateElementIndex(data);
    this._updateSelectedElementWrapper(data, opts);
  }

  getConfig() {
    // TODO 
    return JSON.parse(JSON.stringify(this._helperConfig));
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
      wrapper.topLeft, wrapper.top, wrapper.topRight, wrapper.right,
      wrapper.bottomRight, wrapper.bottom, wrapper.bottomLeft, wrapper.left,
    ];
    const directionNames: TypeHelperWrapperDotDirection[] = [
      'top-left', 'top', 'top-right', 'right',
      'bottom-right', 'bottom', 'bottom-left', 'left',
    ];
    for (let i = 0; i < dots.length; i ++) {
      const dot = dots[i];
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, wrapper.dotSize, 0, Math.PI * 2);
      ctx.closePath();
      if (ctx.isPointInPath(p.x, p.y)) {
        direction = directionNames[i];
        break;
      }
    }
    return [uuid, direction];
  }

  private _updateElementIndex(data: TypeData) {
    this._helperConfig.elementIndexMap = {};
    data.elements.forEach((elem: TypeElement<keyof TypeElemDesc>, i) => {
      this._helperConfig.elementIndexMap[elem.uuid] = i;
    });
  }

  private _updateSelectedElementWrapper(data: TypeData, opts: TypeHelperUpdateOpts) {
    const { selectedUUID: uuid, scale } = opts;
    if (!(typeof uuid === 'string' && this._helperConfig.elementIndexMap[uuid] >= 0)) {
      delete this._helperConfig.selectedElementWrapper;
      return;
    }
    const index: number = this._helperConfig.elementIndexMap[uuid];
    const elem = data.elements[index];

    const dotSize = this._coreConfig.elementWrapper.dotSize / scale;
    const lineWidth = this._coreConfig.elementWrapper.lineWidth / scale;
    const lineDash = this._coreConfig.elementWrapper.lineDash.map(n => (n / scale));
    
    const wrapper = {
      uuid,
      dotSize: dotSize,
      lineWidth: lineWidth,
      lineDash: lineDash,
      color: '#2ab6f1',
      topLeft: {
        x: elem.x - dotSize,
        y: elem.y - dotSize,
      },
      top: {
        x: elem.x + elem.w / 2,
        y: elem.y - dotSize,
      },
      topRight: {
        x: elem.x + elem.w + dotSize,
        y: elem.y - dotSize,
      },
      right: {
        x: elem.x + elem.w + dotSize,
        y: elem.y + elem.h / 2,
      },
      bottomRight: {
        x: elem.x + elem.w + dotSize,
        y: elem.y + elem.h + dotSize,
      },
      bottom: {
        x: elem.x + elem.w / 2,
        y: elem.y + elem.h + dotSize,
      },
      bottomLeft: {
        x: elem.x - dotSize,
        y: elem.y + elem.h + dotSize,
      },
      left: {
        x: elem.x - dotSize,
        y: elem.y + elem.h / 2 - dotSize / 2,
      },
    }
    this._helperConfig.selectedElementWrapper = wrapper;
  }
}