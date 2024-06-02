import { createBoardContent, deepClone } from '../../util/src';
import { Board } from '../src';
import { MiddlewareSelector, MiddlewareScroller, MiddlewareScaler } from '../../core/src';
import data from './data';

const devicePixelRatio = window.devicePixelRatio;
// const width = window.innerWidth;
// const height = window.innerHeight;

const width = 800;
const height = 600;

const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
canvas.width = width * devicePixelRatio;
canvas.height = height * devicePixelRatio;
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;
// const ctx1 = canvas.getContext('2d') as CanvasRenderingContext2D;
const boardContent1 = createBoardContent(canvas, { width, height, devicePixelRatio });
const board = new Board({ boardContent: boardContent1 });

const sharer1 = board.getSharer();
sharer1.setActiveViewSizeInfo({
  devicePixelRatio,
  width,
  height,
  contextWidth: width,
  contextHeight: height
});
const data1 = deepClone(data);
board.resize(sharer1.getActiveViewSizeInfo());
board.setData(data1);
board.use(MiddlewareSelector);
board.use(MiddlewareScroller);
board.use(MiddlewareScaler);
// board.scale(2);
// board.scrollX(-50);
// board.scrollY(-50);
