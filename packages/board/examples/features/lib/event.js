import { isPointInElement, moveElement } from './action.js';

let selectIdx = -1;
let prevPoint = { x: null, y: null };

export function initEvent(board) {

  board.on('point', (p) => {
    selectIdx = isPointInElement(board, p);
  });

  board.on('move', (p) => {
    moveElement(board, selectIdx, p.x - prevPoint.x, p.y - prevPoint.y);
    prevPoint = p;
  });

  board.on('moveStart', (p) => {
    prevPoint = p;
  });

  board.on('moveEnd', (p) => {
    selectIdx = false;
  });

  board.on('scale', (num) => {
    console.log('on("scale") = ', num);
  });

  board.on('scrollX', (num) => {
    console.log('on("scrollX") = ', num);
  });

  board.on('scrollX', (num) => {
    console.log('on("scrollX") = ', num);
  });

  board.on('hover', (p) => {
    // console.log('hover', p);
  })
}