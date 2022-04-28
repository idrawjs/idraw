import opts from './opts.js';
import { getData } from './data.js';

export function drawData(board, idx) {
  const ctx = board.getContext();
  const helperCtx = board.getHelperContext();
  const data = getData();
  board.clear();
  ctx.clearRect(0, 0, opts.devicePixelRatio * opts.contextWidth, opts.devicePixelRatio * opts.contextHeight);
  helperCtx.clearRect(0, 0, opts.devicePixelRatio * opts.contextWidth, opts.devicePixelRatio * opts.contextHeight);

  // ctx.setFillStyle('#ffffff');
  // ctx.fillRect(0, 0, opts.width, opts.height);

  data.elements.forEach((ele, i) => {
    ctx.setFillStyle(ele.desc.color);
    ctx.fillRect(ele.x, ele.y, ele.w, ele.h);

    // helperCtx.setFillStyle('#2196f3');
    // helperCtx.fillRect(ele.x, ele.y, ele.w, ele.h);

    if (i === idx) {
      helperCtx.beginPath();
      helperCtx.setLineDash([4, 4]);
      helperCtx.setLineWidth(2);
      helperCtx.setStrokeStyle('#2196f3');
      helperCtx.moveTo(ele.x, ele.y);
      helperCtx.lineTo(ele.x + ele.w, ele.y);
      helperCtx.lineTo(ele.x + ele.w, ele.y + ele.h);
      helperCtx.lineTo(ele.x, ele.y + ele.h);
      helperCtx.lineTo(ele.x, ele.y);
      helperCtx.stroke();
      helperCtx.closePath();
    }
  });
  board.draw();
}