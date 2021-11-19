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
    expect(result).toStrictEqual({"position":{"top":100,"bottom":100,"left":150,"right":150},"size":{"x":75,"y":50,"w":300,"h":200}})
    board.draw();
  
    const originCtx = board.getOriginContext2D();
    // @ts-ignore;
    const originCalls = originCtx.__getDrawCalls();
    expect(originCalls).toMatchSnapshot();
  
    const displayCtx = board.getDisplayContext2D();
    // @ts-ignore;
    const displayCalls = displayCtx.__getDrawCalls();
    expect(displayCalls).toMatchSnapshot();
  });


  test('scale 001', async () => {  
    document.body.innerHTML = `
      <div id="mount-001"></div>
    `;
    const opts = {
      width: 600,
      height: 400,
      contextWidth: 1000,
      contextHeight: 900,
      devicePixelRatio: 4
    }
    const mount = document.querySelector('#mount-001') as HTMLDivElement;
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
    expect(result).toStrictEqual({"position":{"top":0,"bottom":-50,"left":50,"right":50},"size":{"x":25,"y":0,"w":500,"h":450}})
    board.draw();
  
    const originCtx = board.getOriginContext2D();
    // @ts-ignore;
    const originCalls = originCtx.__getDrawCalls();
    expect(originCalls).toMatchSnapshot();
  
    const displayCtx = board.getDisplayContext2D();
    // @ts-ignore;
    const displayCalls = displayCtx.__getDrawCalls();
    expect(displayCalls).toMatchSnapshot();
  });


  test('scale 002', async () => {  
    document.body.innerHTML = `
      <div id="mount-002"></div>
    `;
    const opts = {
      width: 600,
      height: 400,
      contextWidth: 1200,
      contextHeight: 600,
      devicePixelRatio: 4
    }
    const mount = document.querySelector('#mount-002') as HTMLDivElement;
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
  
    board.scrollX(-600);
    board.scrollY(-400);
    const result = board.scale(0.5);
    expect(result).toStrictEqual({"position":{"top":50,"bottom":50,"left":0,"right":0},"size":{"x":0,"y":25,"w":600,"h":300}})
    board.draw();
  
    const originCtx = board.getOriginContext2D();
    // @ts-ignore;
    const originCalls = originCtx.__getDrawCalls();
    expect(originCalls).toMatchSnapshot();
  
    const displayCtx = board.getDisplayContext2D();
    // @ts-ignore;
    const displayCalls = displayCtx.__getDrawCalls();
    expect(displayCalls).toMatchSnapshot();
  });


  test('scale 003', async () => {  
    document.body.innerHTML = `
      <div id="mount-003"></div>
    `;
    const opts = {
      width: 600,
      height: 400,
      contextWidth: 1000,
      contextHeight: 600,
      devicePixelRatio: 4
    }
    const mount = document.querySelector('#mount-003') as HTMLDivElement;
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
  
    board.scrollX(400);
    board.scrollY(400);
    const result = board.scale(0.8);
    expect(result).toStrictEqual({"position":{"top":0,"bottom":-80,"left":0,"right":-200},"size":{"x":0,"y":0,"w":800,"h":480}})
    board.draw();
  
    const originCtx = board.getOriginContext2D();
    // @ts-ignore;
    const originCalls = originCtx.__getDrawCalls();
    expect(originCalls).toMatchSnapshot();
  
    const displayCtx = board.getDisplayContext2D();
    // @ts-ignore;
    const displayCalls = displayCtx.__getDrawCalls();
    expect(displayCalls).toMatchSnapshot();
  });
})
