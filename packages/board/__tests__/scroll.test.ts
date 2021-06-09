import Board from '../src';
import { getData } from './data';

test('@idraw/board: scroll', async () => {  
  document.body.innerHTML = `
    <div id="mount"></div>
  `;
  const opts = {
    width: 600,
    height: 400,
    contextWidth: 600,
    contextHeight: 400,
    devicePixelRatio: 4
  }
  const mount = document.querySelector('#mount') as HTMLDivElement;
  const board = new Board(mount, opts);

  const ctx = board.getContext();
  const data = getData();
  board.clear();
  ctx.clearRect(0, 0, opts.width, opts.height);
  ctx.setFillStyle('#ffffff');
  ctx.fillRect(0, 0, opts.width, opts.height);
  data.elements.forEach(ele => {
    ctx.setFillStyle(ele.desc.color);
    ctx.fillRect(ele.x, ele.y, ele.w, ele.h);
  });

  const resultScale =board.scale(2);
  expect(resultScale).toStrictEqual({"position":{"top":0,"bottom":-400,"left":0,"right":-600},"size":{"x":0,"y":0,"w":1200,"h":800}})

  const resultX =board.scrollX(-600);
  expect(resultX).toStrictEqual({"position":{"top":-600,"bottom":-400,"left":0,"right":0},"size":{"x":-1200,"y":0,"w":1200,"h":800}})

  const resultY =board.scrollY(-400); 
  expect(resultY).toStrictEqual({"position":{"top":-600,"bottom":0,"left":-400,"right":0},"size":{"x":-1200,"y":-800,"w":1200,"h":800}})

  board.draw();

  const originCtx = board.getOriginContext();
  // @ts-ignore;
  const originCalls = originCtx.__getDrawCalls();
  expect(originCalls).toMatchSnapshot();

  const displayCtx = board.getDisplayContext();
  // @ts-ignore;
  const displayCalls = displayCtx.__getDrawCalls();
  expect(displayCalls).toMatchSnapshot();
});