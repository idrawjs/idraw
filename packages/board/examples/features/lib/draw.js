import opts from './opts.js';
import { getData } from './data.js';

export function drawData(board) {
  const ctx = board.getContext();
  const data = getData();
  board.clear();
  ctx.clearRect(0, 0, opts.width, opts.height);
  // ctx.setFillStyle('#ffffff');
  // ctx.fillRect(0, 0, opts.width, opts.height);
  data.elements.forEach(ele => {
    ctx.setFillStyle(ele.desc.color);
    ctx.fillRect(ele.x, ele.y, ele.w, ele.h);
  });
  board.draw();
}