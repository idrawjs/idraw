import Context from './../../src/lib/context';
import util from '@idraw/util'
import { getData } from './../data';

const { deepClone } = util.data;

describe('@idraw/board: src/lib/context', () => {
  const options = {
    width: 600,
    height: 400,
    contextWidth: 1000,
    contextHeight: 900,
    devicePixelRatio: 2
  }

  test('Context', async () => {  
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    
    const ctx = new Context(ctx2d, opts);
    const data = getData();
   
    ctx.clearRect(0, 0, opts.contextWidth, opts.contextHeight);
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, opts.contextWidth, opts.contextHeight);
    data.elements.forEach(ele => {
      ctx.setFillStyle(ele.desc.color);
      ctx.fillRect(ele.x, ele.y, ele.w, ele.h);
    }); 
    // @ts-ignore;
    const calls = ctx2d.__getDrawCalls();
    expect(calls).toMatchSnapshot();  
  });

  test('Context.getSize', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context(ctx2d, opts);
    expect(ctx.getSize()).toStrictEqual(opts);
  })

  test('Context.resetSize', async () => { 
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const newOpts = {
      width: 601,
      height: 401,
      contextWidth: 1001,
      contextHeight: 901,
      devicePixelRatio: 3,
    }
    const ctx = new Context(ctx2d, opts);
    ctx.resetSize(newOpts);
    expect(ctx.getSize()).toStrictEqual(newOpts);
  });
  
  test('Context.calcDeviceNum', async () => {  
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context(ctx2d, opts);
    const num = 100;
    expect(ctx.calcDeviceNum(num)).toStrictEqual(opts.devicePixelRatio * num);
  });

  test('Context.calcScreenNum', async () => {  
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context(ctx2d, opts);
    const num = 100;
    expect(ctx.calcScreenNum(num)).toStrictEqual(num / opts.devicePixelRatio);
  });

  test('Context.setTransform', async () => {  
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context(ctx2d, opts);
    const transform = {
      scale: 2,
      scrollX: 100,
      scrollY: -200,
    };
    ctx.setTransform(deepClone(transform))
    expect(ctx.getTransform()).toStrictEqual(deepClone(transform));
  });

  test('Context.getTransform', async () => {  
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context(ctx2d, opts);
    expect(ctx.getTransform()).toStrictEqual({
      scale: 1,
      scrollX: 0,
      scrollY: 0,
    });
  });


  test('Context.setFillStyle', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context(ctx2d, opts);
    const color = '#f0f0f0';
    ctx.setFillStyle(color);
    ctx.fillRect(0, 0, opts.contextWidth, opts.contextHeight);
    expect(ctx2d.fillStyle).toStrictEqual(color);
  });


  test('Context.fill', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context(ctx2d, opts);
    ctx.fill();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    expect(calls).toMatchSnapshot();
  })

  test('Context.arc', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context(ctx2d, opts);
    ctx.arc(70, 80, 50, 0, Math.PI * 2, true);
    ctx.fill();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  })


  test('Context.rect', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context(ctx2d, opts);
    ctx.rect(10, 20, 100, 200);
    ctx.fill();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  })


  test('Context.fillRect', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context(ctx2d, opts);
    ctx.fillRect(0, 0, opts.contextWidth, opts.contextHeight);
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
    // expect(calls).toStrictEqual([
    //   {
    //     type: 'fillRect',
    //     transform: [ 1, 0, 0, 1, 0, 0 ],
    //     props: { x: 0, y: 0, width: 2000, height: 1800 }
    //   }
    // ]);
  })
  
})

