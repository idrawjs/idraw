import type { StrictMaterial, RendererDrawMaterialOptions, ViewContext2D } from '@idraw/types';
import { drawBase, rotateViewMaterial } from './base';

export function drawCircle(ctx: ViewContext2D, mtrl: StrictMaterial<'circle'>, opts: RendererDrawMaterialOptions) {
  rotateViewMaterial(ctx, mtrl, opts, () => {
    drawBase(ctx, mtrl, opts);
  });
}
