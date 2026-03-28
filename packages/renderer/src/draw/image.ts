import type { StrictMaterial, RendererDrawMaterialOptions, ViewContext2D, LoadContent } from '@idraw/types';
import { calcViewMaterialSize } from '@idraw/util';
import { getOpacity } from './box';
import { rotateViewMaterial } from './base';

export function drawImage(ctx: ViewContext2D, mtrl: StrictMaterial<'image'>, opts: RendererDrawMaterialOptions) {
  const content: LoadContent | HTMLCanvasElement | OffscreenCanvas | null = opts.loader.getContent(mtrl);
  const { viewScaleInfo, parentOpacity } = opts;
  const { x, y, width, height, angle } = calcViewMaterialSize(mtrl, { viewScaleInfo }) || mtrl;

  const viewMtrl = { ...mtrl, ...{ x, y, width, height, angle } };
  rotateViewMaterial(ctx, mtrl, opts, () => {
    if (!content && !opts.loader.isDestroyed()) {
      opts.loader.load(mtrl as StrictMaterial<'image'>, opts.materialAssets || {});
    }
    if (mtrl.type === 'image' && content) {
      ctx.globalAlpha = getOpacity(mtrl) * parentOpacity;
      const { x, y, width, height } = viewMtrl;
      const radiusList: number[] = [0, 0, 0, 0]; // TODO
      const attributes = mtrl;
      const { scaleMode, originW = 0, originH = 0 } = attributes;
      const imageW = ctx.$undoPixelRatio(originW);
      const imageH = ctx.$undoPixelRatio(originH);

      ctx.save();
      ctx.fillStyle = 'transparent';
      ctx.beginPath();
      ctx.moveTo(x + radiusList[0], y);
      ctx.arcTo(x + width, y, x + width, y + height, radiusList[1]);
      ctx.arcTo(x + width, y + height, x, y + height, radiusList[2]);
      ctx.arcTo(x, y + height, x, y, radiusList[3]);
      ctx.arcTo(x, y, x + width, y, radiusList[0]);
      ctx.closePath();
      ctx.fill('nonzero');
      ctx.clip('nonzero');

      if (scaleMode && originH && originW) {
        let sx = 0;
        let sy = 0;
        let sWidth = imageW;
        let sHeight = imageH;
        const dx = x;
        const dy = y;
        const dWidth = width;
        const dHeight = height;

        if (imageW > mtrl.width || imageH > mtrl.height) {
          if (scaleMode === 'fill') {
            const sourceScale = Math.max(mtrl.width / imageW, mtrl.height / imageH);
            const newImageWidth = imageW * sourceScale;
            const newImageHeight = imageH * sourceScale;
            sx = (newImageWidth - mtrl.width) / 2 / sourceScale;
            sy = (newImageHeight - mtrl.height) / 2 / sourceScale;
            sWidth = mtrl.width / sourceScale;
            sHeight = mtrl.height / sourceScale;
          } else if (scaleMode === 'tile') {
            sx = 0;
            sy = 0;
            sWidth = mtrl.width;
            sHeight = mtrl.height;
          } else if (scaleMode === 'fit') {
            const sourceScale = Math.min(mtrl.width / imageW, mtrl.height / imageH);
            sx = (imageW - mtrl.width / sourceScale) / 2;
            sy = (imageH - mtrl.height / sourceScale) / 2;
            sWidth = mtrl.width / sourceScale;
            sHeight = mtrl.height / sourceScale;
          }
        }

        ctx.drawImage(content, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      } else {
        ctx.drawImage(content, x, y, width, height);

        // const sx = 0;
        // const sy = 0;
        // const sWidth = imageW;
        // const sHeight = imageH;
        // const dx = x;
        // const dy = y;
        // const dWidth = w;
        // const dHeight = h;
        // ctx.drawImage(content, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      }
      // content = null;

      ctx.globalAlpha = parentOpacity;
      ctx.restore();
    }
  });
}
