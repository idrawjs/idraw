import {
  TypeData,
  TypeHelper,
  TypeHelperConfig,
  TypeHelperCreateOpts,
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
    opts: TypeHelperCreateOpts ) {
    this._updateElementIndex(data);
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

  // private _updateSelectedElementWrapper() {

  // }
}