import type { Data, RendererDrawMaterialOptions, ViewContext2D } from '@idraw/types';
import { getDefaultMaterialAttributes } from '@idraw/util';
import { drawMaterial } from './group';

const defaultAttributes = getDefaultMaterialAttributes();

export function drawMaterialList(ctx: ViewContext2D, data: Data, opts: RendererDrawMaterialOptions) {
  const { materials = [] } = data;
  const { parentOpacity } = opts;
  for (let i = 0; i < materials.length; i++) {
    const material = materials[i];
    const mtrl = {
      ...material,
      ...{
        attributes: {
          ...defaultAttributes,
          ...material,
        },
      },
    };

    if (opts.forceDrawAll !== true) {
      if (!opts.calculator?.needRender(mtrl)) {
        continue;
      }
    }

    try {
      drawMaterial(ctx, mtrl, {
        ...opts,
        ...{
          parentOpacity,
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}
