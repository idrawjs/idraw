import type { StrictMaterial, RendererDrawMaterialOptions, ViewContext2D } from '@idraw/types';
import { drawBase, rotateViewMaterial } from './base';

export function drawRect(ctx: ViewContext2D, mtrl: StrictMaterial<'rect'>, opts: RendererDrawMaterialOptions) {
  rotateViewMaterial(ctx, mtrl, opts, () => {
    drawBase(ctx, mtrl, opts);
  });
}
