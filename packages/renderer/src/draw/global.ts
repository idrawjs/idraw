import type { RendererDrawMaterialOptions, ViewContext2D, DataGlobal } from '@idraw/types';

export function drawGlobalBackground(
  ctx: ViewContext2D,
  global: DataGlobal | undefined,
  opts: RendererDrawMaterialOptions
) {
  if (typeof global?.fill === 'string') {
    const { viewSizeInfo } = opts;
    const { width, height } = viewSizeInfo;
    ctx.globalAlpha = 1;
    ctx.fillStyle = global.fill as string;
    ctx.fillRect(0, 0, width, height);
  }
}
