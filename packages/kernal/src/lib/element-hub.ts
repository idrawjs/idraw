import ElementController from './element-controller';

class ElementHub {

  private _controllerMap: Map<string, ElementController> = new Map();

  constructor() {
    // TODO
  }

  register(type: string, controller: ElementController) {
    if (this._controllerMap.has(type) !== true) {
      this._controllerMap.set(type, controller)
    }
  }

  clear() {
    this._controllerMap.clear();
  }

  getDrawActions() {
    // TODO
  }
}

export default ElementHub;