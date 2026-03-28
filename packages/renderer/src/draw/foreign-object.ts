import type { StrictMaterial, RendererDrawMaterialOptions, ViewContext2D } from '@idraw/types';
import { calcViewMaterialSize } from '@idraw/util';
import { rotateViewMaterial } from './base';

export function drawForeignObject(
  ctx: ViewContext2D,
  mtrl: StrictMaterial<'foreignObject'>,
  opts: RendererDrawMaterialOptions
) {
  const content = opts.loader.getContent(mtrl);
  const { viewScaleInfo } = opts;
  const { x, y, width, height } = calcViewMaterialSize(mtrl, { viewScaleInfo }) || mtrl;
  rotateViewMaterial(ctx, mtrl, opts, () => {
    if (!content && !opts.loader.isDestroyed()) {
      opts.loader.load(mtrl as StrictMaterial<'foreignObject'>, opts.materialAssets || {});
    }
    if (mtrl.type === 'foreignObject' && content) {
      ctx.drawImage(content, x, y, width, height);
    }
  });
}
