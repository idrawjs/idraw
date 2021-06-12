import {
  TypeScreenPosition
} from '@idraw/types';

type TypeOptions = {
  width: number,
  height: number,
  devicePixelRatio: number
};


export class Scroller {

  private _displayCtx: CanvasRenderingContext2D;
  private _opts: TypeOptions;

  constructor(
    ctx: CanvasRenderingContext2D,
    opts: TypeOptions
  ) {
    this._displayCtx = ctx;
    this._opts = opts;
  }

  draw(position: TypeScreenPosition) {
    const { width, height } = this._opts;
    const wrapper = this._calc(position);
    // TODO
    if (this._displayCtx) {
      console.log('scroller-wrapper ===', wrapper);
    }

    const ctx = this._displayCtx;
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = wrapper.color;
    if (wrapper.xSize > 0) {
      // x-line
      ctx.fillRect(0, this._doSize(height - wrapper.lineSize), this._doSize(width), this._doSize(wrapper.lineSize));

      // x-slider
      drawBox(ctx, {
        x: this._doSize(wrapper.translateX),
        y: this._doSize(height - wrapper.lineSize),
        w: this._doSize(wrapper.xSize),
        h: this._doSize(wrapper.lineSize),
        r: this._doSize(wrapper.lineSize / 2),
        color: wrapper.color,
      });
    }

    if (wrapper.ySize > 0) {
      // y-line
      ctx.fillRect(this._doSize(width - wrapper.lineSize), 0, this._doSize(wrapper.lineSize), this._doSize(height));
      ctx.globalAlpha = 1;

      // y-slider
      drawBox(ctx, {
        x: this._doSize(width - wrapper.lineSize),
        y: this._doSize(wrapper.translateY),
        w: this._doSize(wrapper.lineSize),
        h: this._doSize(wrapper.ySize),
        r: this._doSize(wrapper.lineSize / 2),
        color: wrapper.color,
      });
    }
  

    ctx.globalAlpha = 1;
    
  }

  private _calc(position: TypeScreenPosition) {
    const { width, height } = this._opts;
    const sliderMinSize = 50;
    const lineSize = 16;
    let xSize = 0;
    let ySize = 0;
    if (position.left <= 0 || position.right <= 0) {
      xSize = Math.max(
        sliderMinSize, width - (
          Math.abs(position.left < 0 ? position.left : 0) + Math.abs(position.right < 0 ? position.right : 0)
        )
      );
      if (xSize >= width) xSize = 0;
    }
    if (position.top <= 0 || position.bottom <= 0) {
      ySize = Math.max(
        sliderMinSize, height - (
          Math.abs(position.top < 0 ? position.top : 0) + Math.abs(position.bottom < 0 ? position.bottom : 0)
        )
      );
      if (ySize >= height) ySize = 0;
    }

    let translateX = 0;
    if (xSize > 0) {
      translateX = width * Math.abs(position.left) / (Math.abs(position.left) + Math.abs(position.right));
      translateX = Math.min(Math.max(0, translateX - xSize / 2), width - xSize);
    }

    let translateY = 0;
    if (ySize > 0) {
      translateY = height * Math.abs(position.top) / (Math.abs(position.top) + Math.abs(position.bottom));
      translateY = Math.min(Math.max(0, translateY - ySize / 2), height - ySize);
    }
    const scrollWrapper = {
      lineSize,
      xSize,
      ySize,
      translateY,
      translateX,
      color: '#e0e0e0'
    };
    return scrollWrapper;
  }

  private _doSize(num: number) {
    return num * this._opts.devicePixelRatio;
  }
}


function drawBox(
  ctx: CanvasRenderingContext2D,
  opts: { x: number, y: number, w: number, h: number, r: number, color: string }
): void {

  const { x, y, w, h, color } = opts;
  let r = opts.r;
  r = Math.min(r, w / 2, h / 2);
  if (w < r * 2 || h < r * 2) {
    r = 0;
  };
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();  
  ctx.fillStyle = color;
  ctx.fill(); 
}