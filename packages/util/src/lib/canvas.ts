import type { ViewContent } from '@idraw/types';
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

export function createOffscreenContext2D(opts: { width: number; height: number }) {
  const { width, height } = opts;
  const offCanvas = new OffscreenCanvas(width, height);
  const offRenderCtx = offCanvas.getContext('2d') as OffscreenRenderingContext;
  const offCtx: CanvasRenderingContext2D | OffscreenRenderingContext = offRenderCtx.canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenRenderingContext;
  return offCtx;
}

export function createBoardContexts(ctx: CanvasRenderingContext2D, opts?: { devicePixelRatio: number }): ViewContent {
  const ctxOpts = {
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    devicePixelRatio: opts?.devicePixelRatio || 1
  };
  const viewContext = createContext2D(ctxOpts);
  const helperContext = createContext2D(ctxOpts);
  const boardContext = createContext2D({ ctx, ...ctxOpts });
  const content: ViewContent = {
    viewContext,
    helperContext,
    boardContext
  };
  return content;
}
