import {
  TypePoint,
  TypeScreenPosition
} from '@idraw/types';
import util from '@idraw/util';

type TypeOptions = {
  width: number,
  height: number,
  devicePixelRatio: number,
  scrollConfig?: TypeScrollConfig,
};

type TypePrivateOptions = TypeOptions & {
  width: number,
  height: number,
  devicePixelRatio: number,
  scrollConfig: TypeScrollConfig,
}


const defaultScrollConfig = {
  lineWidth: 12,
  color: '#a0a0a0'
}

export type TypeScrollConfig = {
  color: string,
  lineWidth: number
}

export class Scroller {

  private _displayCtx: CanvasRenderingContext2D;
  private _opts: TypePrivateOptions;

  constructor(
    ctx: CanvasRenderingContext2D,
    opts: TypeOptions
  ) {
    this._displayCtx = ctx;
    this._opts = this._getOpts(opts);
  }

  draw(position: TypeScreenPosition) {
    const { width, height } = this._opts;
    const wrapper = this.calc(position);
    const ctx = this._displayCtx;
    
    if (wrapper.xSize > 0) {
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = wrapper.color;
      // x-line
      ctx.fillRect(0, this._doSize(height - wrapper.lineSize), this._doSize(width), this._doSize(wrapper.lineSize));

      ctx.globalAlpha = 1;
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
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = wrapper.color;

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

  isPointAtScrollY(p: TypePoint): boolean {
    const { width, height, scrollConfig } = this._opts;
    const ctx = this._displayCtx;
    ctx.beginPath();
    ctx.rect(
      this._doSize(width - scrollConfig.lineWidth), 
      0, 
      this._doSize(scrollConfig.lineWidth), 
      this._doSize(height)
    );
    ctx.closePath();
    if (ctx.isPointInPath(this._doSize(p.x), this._doSize(p.y))) {
      return true;
    } 
    return false;
  }

  isPointAtScrollX(p: TypePoint): boolean {
    const { width, height, scrollConfig } = this._opts;
    const ctx = this._displayCtx;
    ctx.beginPath();
    ctx.rect(
      0, 
      this._doSize(height - scrollConfig.lineWidth), 
      this._doSize(width - scrollConfig.lineWidth), 
      this._doSize(scrollConfig.lineWidth)
    );
    ctx.closePath();
    if (ctx.isPointInPath(this._doSize(p.x), this._doSize(p.y))) {
      return true;
    } 
    return false;
  }

  
  calc(position: TypeScreenPosition) {
    const { width, height, scrollConfig } = this._opts;
    const sliderMinSize = scrollConfig.lineWidth * 2.5;
    const lineSize = scrollConfig.lineWidth;
    let xSize = 0;
    let ySize = 0;
    if (position.left <= 0 && position.right <= 0) {
      xSize = Math.max(sliderMinSize, width - (Math.abs(position.left) + Math.abs(position.right)));
      if (xSize >= width) xSize = 0;
    }
    if (position.top <= 0 || position.bottom <= 0) {
      ySize = Math.max(sliderMinSize, height - (Math.abs(position.top) + Math.abs(position.bottom)));
      if (ySize >= height) ySize = 0;
    }

    let translateX = 0;
    if (xSize > 0) {
      translateX = xSize / 2 + (width - xSize) * Math.abs(position.left) / (Math.abs(position.left) + Math.abs(position.right));
      translateX = Math.min(Math.max(0, translateX - xSize / 2), width - xSize);
      // const xUnit = this.calcScreenScrollUnit(position.left, position.right, xSize, width);
      // translateX = translateX * xUnit;
    }

    let translateY = 0;
    if (ySize > 0) {
      translateY = ySize / 2 + (height - ySize) * Math.abs(position.top) / (Math.abs(position.top) + Math.abs(position.bottom));
      translateY = Math.min(Math.max(0, translateY - ySize / 2), height - ySize);
      // const yUnit = this.calcScreenScrollUnit(position.top, position.bottom, ySize, height);
      // translateY = translateY * yUnit;
    }
    const scrollWrapper = {
      lineSize,
      xSize,
      ySize,
      translateY,
      translateX,
      color: this._opts.scrollConfig.color
    };
    return scrollWrapper;
  }

  private _doSize(num: number) {
    return num * this._opts.devicePixelRatio;
  }

 
  private _getOpts(opts: TypeOptions): TypePrivateOptions {
    const options =  { ...{ scrollConfig: defaultScrollConfig }, ...opts};
    if (!options.scrollConfig) {
      options.scrollConfig = defaultScrollConfig;
    }
    if (!(options.scrollConfig.lineWidth > 0)) {
      options.scrollConfig.lineWidth = defaultScrollConfig.lineWidth;
    }
    options.scrollConfig.lineWidth = Math.max(options.scrollConfig.lineWidth, defaultScrollConfig.lineWidth);

    if (util.color.isColorStr(options.scrollConfig.color) !== true) {
      options.scrollConfig.color = options.scrollConfig.color;
    }
    return options;
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