import Board from './../src';
import { getData } from './data';


describe('@idraw/board', () => {
  test('context', async () => {  
    document.body.innerHTML = `
      <div id="mount"></div>
    `;
    const opts = {
      width: 600,
      height: 400,
      contextWidth: 1000,
      contextHeight: 900,
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

