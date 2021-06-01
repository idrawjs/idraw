import {
  TypeContext,
} from '@idraw/types';


export function clearContext(ctx: TypeContext) {
  ctx.setFillStyle('rgb(0 0 0 / 0%)');
  ctx.setStrokeStyle('rgb(0 0 0 / 0%)');
}

export function drawBgColor(ctx: TypeContext, color: string) {
  const size = ctx.getSize();
  ctx.setFillStyle(color);
  ctx.fillRect(0, 0, size.width, size.height);
}