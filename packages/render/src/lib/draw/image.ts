import {
  TypeContext,
  TypeElement,
} from '@idraw/types';
import { rotateElement } from '../transform';
import Loader from '../loader';
 

export function drawImage (
  ctx: TypeContext,
  elem: TypeElement<'image'>,
  loader: Loader,
) {
  // const desc = elem.desc as TypeElemDesc['rect'];
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
//   TypeContext, 
//   TypeElement,
//   TypeHelperConfig,
//   TypeElemDesc,
// } from '@idraw/types';
// import Loader from '../loader';
// import { drawBox } from './base';

// export function drawImage(
//   ctx: TypeContext,
//   elem: TypeElement<'image'>,
//   loader: Loader,
//   helperConfig: TypeHelperConfig
// ) {
//   const content = loader.getPattern(elem, {
//     forceUpdate: helperConfig?.selectedElementWrapper?.uuid === elem.uuid
//   });
//   drawBox(ctx, elem, content);
// }




 

