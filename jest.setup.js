/* eslint-disable no-undef */
// mock OffscreenCanvas
global.OffscreenCanvas = class OffscreenCanvas {
  constructor(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    this.__canvas = canvas;
  }
  getContext(type) {
    return this.__canvas.getContext(type);
  }
  get width() {
    return this.__canvas.width;
  }
  set width(value) {
    this.__canvas.width = value;
  }
  get height() {
    return this.__canvas.height;
  }
  set height(value) {
    this.__canvas.height = value;
  }

  get canvas() {
    return this.__canvas;
  }
};
