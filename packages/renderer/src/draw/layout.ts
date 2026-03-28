import type { RendererDrawMaterialOptions, ViewContext2D, DataLayout, StrictMaterial } from '@idraw/types';
import { calcViewMaterialSize } from '@idraw/util';
import { createColor } from './color';

export function drawLayout(
  ctx: ViewContext2D,
  layout: DataLayout,
  opts: RendererDrawMaterialOptions,
  renderContent: (ctx: ViewContext2D) => void
) {
  const { parentOpacity } = opts;

  ctx.globalAlpha = 1;

  const { viewScaleInfo } = opts;
  const mtrl: StrictMaterial<'group'> = {
    id: 'layout',
    type: 'group',
    ...layout,
  } as unknown as StrictMaterial<'group'>;
  const viewMtrlSize = calcViewMaterialSize(mtrl, { viewScaleInfo }) || mtrl;
  const viewMtrl = { ...mtrl, ...viewMtrlSize };
  const { x, y, width, height, fill } = viewMtrl;
  const radiusList: number[] = [0, 0, 0, 0]; // TODO

  ctx.save();
  ctx.fillStyle = createColor(ctx, fill, { viewMaterialSize: viewMtrlSize, viewScaleInfo, opacity: mtrl.opacity || 1 });
  ctx.beginPath();
  ctx.moveTo(x + radiusList[0], y);
  ctx.arcTo(x + width, y, x + width, y + height, radiusList[1]);
  ctx.arcTo(x + width, y + height, x, y + height, radiusList[2]);
  ctx.arcTo(x, y + height, x, y, radiusList[3]);
  ctx.arcTo(x, y, x + width, y, radiusList[0]);
  ctx.closePath();
  ctx.fill('nonzero');

  if (layout.overflow === 'hidden') {
    ctx.clip('nonzero');
  }

  renderContent(ctx);

  if (layout.overflow === 'hidden') {
    ctx.restore();
  }

  ctx.globalAlpha = parentOpacity;
}
