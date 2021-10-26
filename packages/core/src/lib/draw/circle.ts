import { TypeContext, TypeElement, } from '@idraw/types';
// import util from '@idraw/util'
import { rotateElement } from './../transform';
// import is from './../is';
import { clearContext } from './base';

export function drawCircle(ctx: TypeContext, elem: TypeElement<'circle'>) {
  clearContext(ctx);
  rotateElement(ctx, elem, (ctx) => {
    const { x, y, w, h, desc } = elem;
    const {
      bgColor = '#000000',
      borderColor = '#000000',
      borderWidth = 0,
    } = desc;

    const a = w / 2;
    const b = h / 2;
    const centerX = x + a;
    const centerY = y + b;

    // draw border
    if (borderWidth && borderWidth > 0) {

      const ba = borderWidth / 2 + a;
      const bb = borderWidth / 2 + b;
      ctx.beginPath();
      ctx.setStrokeStyle(borderColor);
      ctx.setLineWidth(borderWidth);
      ctx.ellipse(centerX, centerY, ba, bb, 0,  0, 2 * Math.PI)
      
      ctx.closePath();
      ctx.stroke();
    }

    // draw content
    ctx.beginPath();
    ctx.setFillStyle(bgColor);
    ctx.ellipse(centerX, centerY, a, b, 0,  0, 2 * Math.PI)
    ctx.closePath();
    ctx.fill();
    
    // // draw shadow
    // clearContext(ctx);
    // if ((desc.shadowOffsetX !== undefined && is.number(desc.shadowOffsetX)) || desc.shadowOffsetY !== undefined && is.number(desc.shadowOffsetY)) {

    //   if (desc.shadowColor !== undefined && util.color.isColorStr(desc.shadowColor)) {
    //     ctx.setShadowColor(desc.shadowColor);
    //   }
    //   if (desc.shadowOffsetX !== undefined && is.number(desc.shadowOffsetX)) {
    //     ctx.setShadowOffsetX(desc.shadowOffsetX);
    //   }
    //   if (desc.shadowOffsetY !== undefined && is.number(desc.shadowOffsetY)) {
    //     ctx.setShadowOffsetY(desc.shadowOffsetY);
    //   }
    //   if (desc.shadowBlur !== undefined && is.number(desc.shadowBlur)) {
    //     ctx.setShadowBlur(desc.shadowBlur);
    //   }

    //   const a = (w + borderWidth * 2) / 2;
    //   const b = (h + borderWidth * 2) / 2;
    //   const centerX = x + a - borderWidth;
    //   const centerY = y + b - borderWidth;
    //   const unit = (a > b) ? 1 / a : 1 / b;

    //   ctx.beginPath();
    //   ctx.setFillStyle('#ffffff6a');
    //   ctx.moveTo(centerX + a, centerY);
    //   for(var i = 0; i < 2 * Math.PI; i += unit) {
    //     ctx.lineTo(centerX + a * Math.cos(i), centerY + b * Math.sin(i));
    //   }
    //   ctx.closePath();
    //   ctx.fill();
    // }

  })
}