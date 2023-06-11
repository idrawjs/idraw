/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Context2D } from './../../src/lib/context2d';
import { deepClone } from './../../src/index';
import { getData } from './data';

describe('@idraw/board: src/lib/context', () => {
  const options = {
    width: 600,
    height: 400,
    contextWidth: 1000,
    contextHeight: 900,
    devicePixelRatio: 2
  };

  test('Context', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

    const ctx = new Context2D(ctx2d, opts);
    const data = getData();

    ctx.clearRect(0, 0, opts.contextWidth, opts.contextHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, opts.contextWidth, opts.contextHeight);
    data.elements.forEach((ele) => {
      ctx.fillStyle = ele.detail.color;
      ctx.fillRect(ele.x, ele.y, ele.w, ele.h);
    });
    // @ts-ignore;
    const calls = ctx2d.__getDrawCalls();
    expect(calls).toMatchSnapshot();
  });

  test('Context.setFillStyle', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const color = '#f0f0f0';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, opts.contextWidth, opts.contextHeight);
    expect(ctx2d.fillStyle).toStrictEqual(color);
  });

  test('Context.fill', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.fill();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    expect(calls).toMatchSnapshot();
  });

  test('Context.arc', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.arc(70, 80, 50, 0, Math.PI * 2, true);
    ctx.fill();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.rect', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.rect(10, 20, 100, 200);
    ctx.fill();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.fillRect', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.fillRect(10, 20, 80, 100);
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
  });

  test('Context.clearRect', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.clearRect(0, 0, opts.contextWidth, opts.contextHeight);
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.beginPath', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.beginPath();
    ctx.fill();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.closePath', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.closePath();
    ctx.fill();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.lineTo', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.lineTo(10, 20);
    ctx.fill();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.moveTo', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.moveTo(10, 20);
    ctx.fill();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.arcTo', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.arcTo(50, 50, 100, 100, Math.PI * 2);
    ctx.fill();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.setLineWidth', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const lineWidth = 12;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.lineWidth = lineWidth;
    expect(ctx2d.lineWidth).toStrictEqual(lineWidth * opts.devicePixelRatio);
  });

  test('Context.setLineDash', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const lineDash = [10, 20];
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.setLineDash(lineDash);
    // @ts-ignore
    // const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    // expect(calls).toMatchSnapshot();
    expect(ctx2d.getLineDash()).toStrictEqual(lineDash.map((n) => n * opts.devicePixelRatio));
  });

  test('Context.setStrokeStyle', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const color = '#f0f0f0';
    ctx.strokeStyle = color;
    ctx.fillRect(0, 0, opts.contextWidth, opts.contextHeight);
    expect(ctx2d.strokeStyle).toStrictEqual(color);
  });

  // TODO
  test('Context.isPointInPath', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    // const lineDash = [10, 20];
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const x = 50;
    const y = 50;
    const w = 50;
    const h = 50;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.closePath();

    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    expect(ctx.isPointInPath(51, 51)).toStrictEqual(ctx2d.isPointInPath(60 * opts.devicePixelRatio, 60 * opts.devicePixelRatio));
  });

  test('Context.setStrokeStyle', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const color = '#f0f0f0';
    ctx.strokeStyle = color;
    expect(ctx2d.strokeStyle).toStrictEqual(color);
  });

  test('Context.stroke', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.rect(10, 20, 100, 200);
    ctx.stroke();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.translate', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const x = 50;
    const y = 60;
    ctx.translate(x, y);
    ctx.rect(10, 20, 100, 200);
    ctx.stroke();
    ctx.translate(-x, -y);
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    expect(calls).toMatchSnapshot();
  });

  test('Context.rotate', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const radian = Math.PI / 6;
    ctx.rotate(radian);
    ctx.rect(10, 20, 100, 200);
    ctx.stroke();
    ctx.rotate(-radian);
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.drawImage', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const img = new Image();
    const dx = 11;
    const dy = 12;
    const dw = 51;
    const dh = 52;
    const sx = 61;
    const sy = 62;
    const sw = 101;
    const sh = 102;
    ctx.drawImage(img, dx, dy);
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.createPattern', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const img = new Image();
    const pattern = ctx.createPattern(img, 'repeat') as CanvasPattern;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, 300, 300);
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(ctx2d.fillStyle).toStrictEqual(pattern);
    expect(calls).toMatchSnapshot();
  });

  test('Context.measureText', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.$setFont({ fontSize: 20 });
    const size = ctx.measureText('Hello World!');
    expect(size.width).toStrictEqual(12);
  });

  test('Context.setTextAlign', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const textAlign = 'center';
    ctx.textAlign = textAlign;
    ctx.fillRect(0, 0, opts.contextWidth, opts.contextHeight);
    expect(ctx2d.textAlign).toStrictEqual(textAlign);
  });

  test('Context.fillText', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.fillText('Hello world', 50, 100);
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.$setFont', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const fontSize = 22;
    const fontFamily = 'Hello';
    const fontWeight = 'bold';
    ctx.$setFont({
      fontSize,
      fontFamily,
      fontWeight
    });
    // console.log('ctx2d.font =', ctx2d.font);
    expect(ctx2d.font).toStrictEqual([fontWeight, fontSize * opts.devicePixelRatio + 'px', fontFamily].join(' '));
  });

  test('Context.textBaseline', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const textBaseline = 'bottom';
    ctx.textBaseline = textBaseline;
    expect(ctx2d.textBaseline).toStrictEqual(textBaseline);
  });

  test('Context.globalAlpha', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const globalAlpha = 0.45;
    ctx.globalAlpha = globalAlpha;
    expect(ctx2d.globalAlpha).toStrictEqual(globalAlpha);
  });

  test('Context.save', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.save();
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(10, 10, 100, 100);
    ctx.restore();
    ctx.fillRect(150, 75, 100, 100);
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.restore', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    ctx.save();
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(10, 10, 100, 100);
    ctx.restore();
    ctx.fillRect(150, 75, 100, 100);
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });

  test('Context.scale', async () => {
    const opts = deepClone(options);
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth;
    canvas.height = opts.contextHeight;
    const ctx2d: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ctx = new Context2D(ctx2d, opts);
    const scaleX = 2;
    const scaleY = 3;
    ctx.scale(scaleX, scaleY);
    ctx.rect(10, 20, 100, 200);
    ctx.stroke();
    // @ts-ignore
    const calls = ctx2d.__getDrawCalls();
    // console.log('calls =', JSON.stringify(calls, null, 2));
    expect(calls).toMatchSnapshot();
  });
});
