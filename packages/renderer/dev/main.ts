import { calcElementListSize, createOffscreenContext2D } from '../../util/src';
import type { ViewContext2D, ElementSize } from '../../types/src';
import { Renderer } from '../../renderer/src';
import { Calculator, Sharer } from '../../board/src';

import data from './data';

const devicePixelRatio = window.devicePixelRatio;

// const devicePixelRatio = 1.5;
const previewWidth = 600;
const previewHeight = 400;
const container = document.querySelector('#mount') as HTMLDivElement;

const canvas = document.createElement('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
canvas.width = previewWidth;
canvas.height = previewHeight;

const renderPreview = (opts: { viewContext: ViewContext2D; outputSize: ElementSize }) => {
  if (!ctx || !canvas) {
    return;
  }
  const { viewContext, outputSize } = opts;
  let width = previewWidth;
  let height = (previewWidth * outputSize.h) / outputSize.w;
  if (height > width) {
    height = previewWidth;
    width = (previewWidth * outputSize.w) / outputSize.h;
  }
  canvas.width = width;
  canvas.height = height;

  const offScreenCanvas = viewContext.$getOffscreenCanvas() as OffscreenCanvas;

  // console.log('offScreenCanvas.width ====== ', offScreenCanvas);
  ctx.drawImage(offScreenCanvas, 0, 0, width, height);
};

container.innerHTML = '';
container.appendChild(canvas);

const outputSize = calcElementListSize(data.elements);
const sharer = new Sharer();
const viewContext = createOffscreenContext2D({
  width: outputSize.w,
  height: outputSize.h,
  devicePixelRatio
});
const calculator = new Calculator({
  viewContext
});
const renderer = new Renderer({
  viewContext,
  sharer,
  calculator
});

const draw = () => {
  renderer.drawData(data, {
    viewScaleInfo: { scale: 1, offsetLeft: -outputSize.x, offsetTop: -outputSize.y, offsetBottom: 0, offsetRight: 0 },
    viewSizeInfo: {
      width: outputSize.w,
      height: outputSize.h,
      devicePixelRatio,
      contextWidth: outputSize.w,
      contextHeight: outputSize.h
    }
  });
  renderPreview({ viewContext, outputSize });
};

renderer.on('load', () => {
  draw();
});

draw();
