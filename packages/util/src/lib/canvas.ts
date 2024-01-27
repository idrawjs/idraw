import type { BoardContent, ViewContext2D } from '@idraw/types';
import { Context2D } from './context2d';

export function createContext2D(opts: { ctx?: CanvasRenderingContext2D; width: number; height: number; devicePixelRatio: number }): Context2D {
  const { width, height, ctx, devicePixelRatio } = opts;
  let context: CanvasRenderingContext2D | undefined = ctx;
  if (!context) {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    context = canvas.getContext('2d') as CanvasRenderingContext2D;
  }
  const context2d = new Context2D(context, opts);
  return context2d;
}

export function createOffscreenContext2D(opts: { width: number; height: number; devicePixelRatio: number }): Context2D {
  const { width, height, devicePixelRatio } = opts;
  const offCanvas = new OffscreenCanvas(width * devicePixelRatio, height * devicePixelRatio);
  const offRenderCtx = offCanvas.getContext('2d') as OffscreenRenderingContext;
  const offCtx: CanvasRenderingContext2D | OffscreenRenderingContext = offRenderCtx.canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenRenderingContext;
  const context2d = new Context2D(offCtx, {
    devicePixelRatio,
    offscreenCanvas: offCanvas
  });
  return context2d;
}

export function createBoardContent(
  canvas: HTMLCanvasElement,
  opts: {
    width: number;
    height: number;
    devicePixelRatio: number;
    offscreen?: boolean;
    createCustomContext2D?: (opts: { width: number; height: number; devicePixelRatio: number }) => ViewContext2D;
  }
): BoardContent {
  const { width, height, devicePixelRatio, offscreen, createCustomContext2D } = opts;
  const ctxOpts = {
    width,
    height,
    devicePixelRatio
  };

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  if (createCustomContext2D) {
    // TODO
    const viewContext = createCustomContext2D(ctxOpts);
    const helperContext = createCustomContext2D(ctxOpts);
    const underContext = createCustomContext2D(ctxOpts);
    const boardContext = createContext2D({ ctx, ...ctxOpts });

    const drawView = () => {
      const { width: w, height: h } = viewContext.$getSize();

      boardContext.clearRect(0, 0, w, h);
      boardContext.drawImage(underContext.canvas, 0, 0, w, h);
      boardContext.drawImage(viewContext.canvas, 0, 0, w, h);
      boardContext.drawImage(helperContext.canvas, 0, 0, w, h);
      underContext.clearRect(0, 0, w, h);
      viewContext.clearRect(0, 0, w, h);
      helperContext.clearRect(0, 0, w, h);
    };

    const content: BoardContent = {
      underContext,
      viewContext,
      helperContext,
      boardContext,
      drawView
    };
    return content;
  }

  if (offscreen === true) {
    // const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const viewContext = createOffscreenContext2D(ctxOpts);
    const helperContext = createOffscreenContext2D(ctxOpts);
    const underContext = createOffscreenContext2D(ctxOpts);
    const boardContext = createContext2D({ ctx, ...ctxOpts });

    const drawView = () => {
      const { width: w, height: h } = viewContext.$getSize();

      boardContext.clearRect(0, 0, w, h);
      boardContext.drawImage(underContext.canvas, 0, 0, w, h);
      boardContext.drawImage(viewContext.canvas, 0, 0, w, h);
      boardContext.drawImage(helperContext.canvas, 0, 0, w, h);
      underContext.clearRect(0, 0, w, h);
      viewContext.clearRect(0, 0, w, h);
      helperContext.clearRect(0, 0, w, h);
    };

    const content: BoardContent = {
      underContext,
      viewContext,
      helperContext,
      boardContext,
      drawView
    };
    return content;
  } else {
    // const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const viewContext = createContext2D(ctxOpts);
    const helperContext = createContext2D(ctxOpts);
    const underContext = createContext2D(ctxOpts);
    const boardContext = createContext2D({ ctx, ...ctxOpts });

    const drawView = () => {
      boardContext.clearRect(0, 0, width, height);
      boardContext.drawImage(underContext.canvas, 0, 0, width, height);
      boardContext.drawImage(viewContext.canvas, 0, 0, width, height);
      boardContext.drawImage(helperContext.canvas, 0, 0, width, height);
      underContext.clearRect(0, 0, width, height);
      viewContext.clearRect(0, 0, width, height);
      helperContext.clearRect(0, 0, width, height);
    };

    const content: BoardContent = {
      underContext,
      viewContext,
      helperContext,
      boardContext,
      drawView
    };
    return content;
  }
}
