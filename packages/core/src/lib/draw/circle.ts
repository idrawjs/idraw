import {
  TypeContext, 
  TypeElement,
} from '@idraw/types';
import { rotateElement } from './../transform';

export function drawCircle(ctx: TypeContext, elem: TypeElement<'circle'>) {

  rotateElement(ctx, elem, (ctx) => {
    const { x, y, w, h, desc } = elem;
    const {
      bgColor = '#000000',
      borderColor = '#000000',
      borderWidth
    } = desc;
    const a = w / 2;
    const b = h / 2;
    const centerX = x + a;
    const centerY = y + b;
    const unit = (a > b) ? 1 / a : 1 / b;
    if (borderWidth && borderWidth > 0) {
      const ba = borderWidth / 2 + a;
      const bb = borderWidth / 2 + b;
      ctx.beginPath();
      ctx.setStrokeStyle(borderColor);
      ctx.setLineWidth(borderWidth)
      ctx.moveTo(centerX + ba, centerY);
      for(var i = 0; i < 2 * Math.PI; i += unit) {
        ctx.lineTo(centerX + ba * Math.cos(i), centerY + bb * Math.sin(i));
      }
      ctx.lineTo(centerX + ba, centerY);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.setFillStyle(bgColor);
    ctx.moveTo(centerX + a, centerY);
    for(var i = 0; i < 2 * Math.PI; i += unit) {
      ctx.lineTo(centerX + a * Math.cos(i), centerY + b * Math.sin(i));
    }
    ctx.closePath();
    ctx.fill();

    // ctx.beginPath();
    // ctx.setFillStyle(color);
    // ctx.arc(x + a, y + b, r, 0, 2 * Math.PI, false);
    // ctx.closePath();
    // ctx.fill();

    // ctx.scale(1, 1);
  })
}