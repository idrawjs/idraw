import { getData } from "./data.js";
import { drawData } from './draw.js';

function isPointInElement(board, p = {x, y}) {
  const ctx = board.getContext();
  const data = getData();
  let idx = -1;
  for (let i = data.elements.length - 1; i >= 0; i--) {
    const ele = data.elements[i];
    ctx.beginPath();
    ctx.lineTo(ele.x, ele.y);
    ctx.lineTo(ele.x + ele.w, ele.y);
    ctx.lineTo(ele.x + ele.w, ele.y + ele.h);
    ctx.lineTo(ele.x, ele.y + ele.h);
    ctx.closePath();
    if (ctx.isPointInPath(p.x, p.y)) {
      idx = i;
      break;
    }
  }
  return idx;
}

function moveElement(board, idx, moveX, moveY) {
  const data = getData();
  if (data.elements[idx]) {
    data.elements[idx].x += moveX;
    data.elements[idx].y += moveY;
  }
  drawData(board)
}

export {
  isPointInElement,
  moveElement,
}