import {
  TypeContext, 
  TypeElement,
  TypeElemDesc,
  TypeHelperConfig,
} from '@idraw/types';
import Loader from '../loader';
import { drawBox } from './base';

export function drawSVG<T extends keyof TypeElemDesc>(
  ctx: TypeContext,
  elem: TypeElement<T>,
  loader: Loader,
  helperConfig: TypeHelperConfig
) {
  const content = loader.getPattern(elem, {
    forceUpdate: helperConfig?.selectedElementWrapper?.uuid === elem.uuid
  });
  drawBox(ctx, elem, content);
}

 

