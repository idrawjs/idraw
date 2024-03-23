import type { Data, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { getDefaultElementDetailConfig } from '@idraw/util';
import { drawElement } from './group';

const defaultDetail = getDefaultElementDetailConfig();

export function drawElementList(ctx: ViewContext2D, data: Data, opts: RendererDrawElementOptions) {
  const { elements = [] } = data;
  const { parentOpacity } = opts;
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const elem = {
      ...element,
      ...{
        detail: {
          ...defaultDetail,
          ...element?.detail
        }
      }
    };
    if (opts.forceDrawAll !== true) {
      if (!opts.calculator?.needRender(elem)) {
        continue;
      }
    }

    try {
      drawElement(ctx, elem, {
        ...opts,
        ...{
          parentOpacity
        }
      });
    } catch (err) {
      console.error(err);
    }
  }
}
