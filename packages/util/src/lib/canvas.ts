import type { ViewContent } from '@idraw/types';

export function createContext2D(opts: {
  width: number;
  height: number;
}): CanvasRenderingContext2D {
  const { width, height } = opts;
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context: CanvasRenderingContext2D = canvas.getContext(
    '2d'
  ) as CanvasRenderingContext2D;
  return context;
}

export function createOffscreenContext2D(opts: {
  width: number;
  height: number;
}) {
  const { width, height } = opts;
  const offCanvas = new OffscreenCanvas(width, height);
  const offRenderCtx = offCanvas.getContext('2d') as OffscreenRenderingContext;
  const offCtx: CanvasRenderingContext2D | OffscreenRenderingContext =
    offRenderCtx.canvas.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenRenderingContext;
  return offCtx;
}

export function createBoardContexts(
  ctx: CanvasRenderingContext2D
): ViewContent {
  const opts = {
    width: ctx.canvas.width,
    height: ctx.canvas.height
  };
  const viewContext = createContext2D(opts);
  const helperContext = createContext2D(opts);
  const content: ViewContent = {
    viewContext,
    helperContext,
    boardContext: ctx
  };
  return content;
}
