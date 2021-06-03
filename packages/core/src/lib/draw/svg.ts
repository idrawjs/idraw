import {
  TypeContext, 
  TypeElement,
  TypeHelperConfig,
} from '@idraw/types';
import Loader from '../loader';
import { drawBox } from './base';

export function drawSVG(
  ctx: TypeContext,
  elem: TypeElement<'svg'>,
  loader: Loader,
  helperConfig: TypeHelperConfig
) {
  const content = loader.getPattern(elem, {
    forceUpdate: helperConfig?.selectedElementWrapper?.uuid === elem.uuid
  });
  drawBox(ctx, elem, content);
}

 

