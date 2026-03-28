import type { StrictMaterial, RendererDrawMaterialOptions, ViewContext2D } from '@idraw/types';
import { calcViewMaterialSize } from '@idraw/util';
import { rotateViewMaterial } from './base';

export function drawSVGCode(ctx: ViewContext2D, mtrl: StrictMaterial<'svgCode'>, opts: RendererDrawMaterialOptions) {
  const content = opts.loader.getContent(mtrl);
  const { viewScaleInfo } = opts;
  const { x, y, width, height } = calcViewMaterialSize(mtrl, { viewScaleInfo }) || mtrl;
  rotateViewMaterial(ctx, mtrl, opts, () => {
    if (!content && !opts.loader.isDestroyed()) {
      opts.loader.load(mtrl as StrictMaterial<'svgCode'>, opts.materialAssets || {});
    }
    if (mtrl.type === 'svgCode' && content) {
      ctx.drawImage(content, x, y, width, height);
    }
  });
}
