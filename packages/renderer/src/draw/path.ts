import type { StrictMaterial, RendererDrawMaterialOptions, ViewContext2D } from '@idraw/types';
import { rotateViewMaterial, drawBase } from './base';

export function drawPath(ctx: ViewContext2D, mtrl: StrictMaterial<'path'>, opts: RendererDrawMaterialOptions) {
  rotateViewMaterial(ctx, mtrl, opts, () => {
    drawBase(ctx, mtrl, opts);
  });
}
