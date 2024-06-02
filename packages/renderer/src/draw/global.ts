import type { RendererDrawElementOptions, ViewContext2D, ElementGlobalDetail } from '@idraw/types';

export function drawGlobalBackground(ctx: ViewContext2D, global: ElementGlobalDetail | undefined, opts: RendererDrawElementOptions) {
  if (typeof global?.background === 'string') {
    const { viewSizeInfo } = opts;
    const { width, height } = viewSizeInfo;
    ctx.globalAlpha = 1;
    ctx.fillStyle = global.background;
    ctx.fillRect(0, 0, width, height);
  }
}
