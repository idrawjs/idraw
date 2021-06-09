import Board from '../src';
import { getData } from './data';

describe('@idraw/board', () => {

  test('scale', async () => {  
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
  
    const result = board.scale(0.5);
    expect(result).toStrictEqual({"position":{"top":150,"bottom":100,"left":100,"right":150},"size":{"x":75,"y":50,"w":300,"h":200}})
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
})
