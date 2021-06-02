import {
  TypeContext, 
  TypeElement,
  TypeHelperConfig,
} from '@idraw/types';
import Loader from '../loader';
import { drawBox } from './base';

export function drawText(
  ctx: TypeContext,
  elem: TypeElement<'text'>,
  loader: Loader,
  helperConfig: TypeHelperConfig
) {
  const content = loader.getPattern(elem, {
    forceUpdate: helperConfig?.selectedElementWrapper?.uuid === elem.uuid
  });
  drawBox(ctx, elem, content);
}


export function createTextSVG(elem: TypeElement<'text'>): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${elem.w}" height = "${elem.h}">
    <foreignObject width="100%" height="100%">
      <div xmlns = "http://www.w3.org/1999/xhtml" style="font-size: ${elem.desc.size}px; color:${elem.desc.color};">
        <span>${elem.desc.text || ''}</span>
      </div>
    </foreignObject>
  </svg>
  `;
  return svg;
}
 

