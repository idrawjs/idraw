import { IDrawContext, DataElement } from '@idraw/types';
import { rotateElement } from '../transform';
import Loader from '../loader';

export function drawSVG(
  ctx: IDrawContext,
  elem: DataElement<'svg'>,
  loader: Loader
) {
  // const desc = elem.desc as DataElemDesc['rect'];
  const content = loader.getContent(elem.uuid);
  rotateElement(ctx, elem, () => {
    // ctx.setFillStyle(desc.color);
    // ctx.fillRect(elem.x, elem.y, elem.w, elem.h);
    if (content) {
      // ctx.drawImage(content, 0, 0, elem.w, elem.h, elem.x, elem.y, elem.w, elem.h);
      ctx.drawImage(content, elem.x, elem.y, elem.w, elem.h);
    }
  });
}

// import {
//   IDrawContext,
//   DataElement,
//   HelperConfig,
// } from '@idraw/types';
// import Loader from '../loader';
// import { drawBox } from './base';

// export function drawSVG(
//   ctx: IDrawContext,
//   elem: DataElement<'svg'>,
//   loader: Loader,
//   helperConfig: HelperConfig
// ) {
//   const content = loader.getPattern(elem, {
//     forceUpdate: helperConfig?.selectedElementWrapper?.uuid === elem.uuid
//   });
//   drawBox(ctx, elem, content);
// }
