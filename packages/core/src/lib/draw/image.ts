
import {
  TypeContext, 
  TypeElement,
  TypeHelperConfig,
} from '@idraw/types';
import Loader from '../loader';
import { drawBox } from './base';

export function drawImage(
  ctx: TypeContext,
  elem: TypeElement<'image'>,
  loader: Loader,
  helperConfig: TypeHelperConfig
) {
  const content = loader.getPattern(elem, {
    forceUpdate: helperConfig?.selectedElementWrapper?.uuid === elem.uuid
  });
  drawBox(ctx, elem, content);
}

 

