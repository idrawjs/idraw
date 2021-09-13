import Context from './../../src/lib/context';
import { getData } from './../data';

describe('@idraw/board: src/lib/context', () => {
  test('Context', async () => {  
    const opts = {
      width: 600,
      height: 400,
      contextWidth: 1000,
      contextHeight: 900,
      devicePixelRatio: 4
    }
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    
    const ctx = new Context(ctx2d, opts);
    const data = getData();
   
    ctx.clearRect(0, 0, opts.width, opts.height);
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, opts.width, opts.height);
    data.elements.forEach(ele => {
      ctx.setFillStyle(ele.desc.color);
      ctx.fillRect(ele.x, ele.y, ele.w, ele.h);
    }); 
    // @ts-ignore;
    const calls = ctx2d.__getDrawCalls();
    expect(calls).toMatchSnapshot();  
  });
})

