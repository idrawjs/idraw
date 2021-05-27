import {
  TypeData,
  TypeHelper,
  TypeHelperConfig,
  TypeHelperUpdateOpts,
  TypeElement,
  TypeElemDesc
} from '@idraw/types';

export class Helper implements TypeHelper {

  private _config: TypeHelperConfig;

  constructor() {
    this._config = {
      elementIndexMap: {},
    }
  }

  updateConfig (
    data: TypeData,
    opts: TypeHelperUpdateOpts ) {
    this._updateElementIndex(data);
    this._updateSelectedElementWrapper(data, opts);
  }

  getConfig() {
    // TODO 
    return JSON.parse(JSON.stringify(this._config));
  }

  private _updateElementIndex(data: TypeData) {
    this._config.elementIndexMap = {};
    data.elements.forEach((elem: TypeElement<keyof TypeElemDesc>, i) => {
      this._config.elementIndexMap[elem.uuid] = i;
    });
  }

  private _updateSelectedElementWrapper(data: TypeData, opts: TypeHelperUpdateOpts) {
    const { selectedUUID: uuid, scale } = opts;
    if (!(typeof uuid === 'string' && this._config.elementIndexMap[uuid] >= 0)) {
      delete this._config.selectedElementWrapper;
      return;
    }
    const index: number = this._config.elementIndexMap[uuid];
    const elem = data.elements[index];

    // TODO
    const dotSize = 4 / Math.min(1, scale);
    const lineWidth = 1 / Math.min(1, scale);
    const lineDash = [4, 3].map(n => (n / Math.min(1, scale)));
    
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
        y: elem.y + elem.h / 2 - dotSize,
      },
    }
    this._config.selectedElementWrapper = wrapper;

  }
}