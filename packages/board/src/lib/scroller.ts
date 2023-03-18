import {
  TypePoint,
  TypeScreenPosition,
  TypeBoardScrollConfig
} from '@idraw/types';
import { isColorStr } from '@idraw/util';

type TypeOptions = {
  width: number;
  height: number;
  devicePixelRatio: number;
  scrollConfig?: TypeBoardScrollConfig;
};

type TypePrivateOptions = Required<
  TypeOptions & { scrollConfig: Required<TypeBoardScrollConfig> }
>;

const minScrollerWidth = 12;
const scrollerAlpha = 0.12;
const scrollerThumbAlpha = 0.36;

const defaultScrollConfig: Partial<TypeBoardScrollConfig> & {
  width: number;
  color: string;
} = {
  width: minScrollerWidth,
  color: '#000000',
  showBackground: true
};

export class Scroller {
  private _displayCtx: CanvasRenderingContext2D;
  private _opts: TypePrivateOptions;

  constructor(ctx: CanvasRenderingContext2D, opts: TypeOptions) {
    this._displayCtx = ctx;
    this._opts = this._getOpts(opts);
  }

  draw(position: TypeScreenPosition) {
    const { width, height, scrollConfig } = this._opts;
    const wrapper = this.calc(position);
    const ctx = this._displayCtx;

    if (wrapper.xSize > 0) {
      if (scrollConfig.showBackground === true) {
        ctx.globalAlpha = scrollerAlpha;
        ctx.fillStyle = wrapper.color;
        // x-line
        ctx.fillRect(
          0,
          this._doSize(height - wrapper.lineSize),
          this._doSize(width),
          this._doSize(wrapper.lineSize)
        );
      }

      // ctx.globalAlpha = 1;
      // x-slider
      drawBoxScrollerThumb(ctx, {
        axis: 'X',
        x: this._doSize(wrapper.translateX),
        y: this._doSize(height - wrapper.lineSize),
        w: this._doSize(wrapper.xSize),
        h: this._doSize(wrapper.lineSize),
        r: this._doSize(wrapper.lineSize / 2),
        color: wrapper.color
      });
    }

    if (wrapper.ySize > 0) {
      if (scrollConfig.showBackground === true) {
        ctx.globalAlpha = scrollerAlpha;
        ctx.fillStyle = wrapper.color;
        // y-line
        ctx.fillRect(
          this._doSize(width - wrapper.lineSize),
          0,
          this._doSize(wrapper.lineSize),
          this._doSize(height)
        );
      }

      // ctx.globalAlpha = 1;
      // y-slider
      drawBoxScrollerThumb(ctx, {
        axis: 'Y',
        x: this._doSize(width - wrapper.lineSize),
        y: this._doSize(wrapper.translateY),
        w: this._doSize(wrapper.lineSize),
        h: this._doSize(wrapper.ySize),
        r: this._doSize(wrapper.lineSize / 2),
        color: wrapper.color
      });
    }

    ctx.globalAlpha = 1;
  }

  resetSize(opts: { width: number; height: number; devicePixelRatio: number }) {
    this._opts = { ...this._opts, ...opts };
  }

  isPointAtScrollY(p: TypePoint): boolean {
    const { width, height, scrollConfig } = this._opts;
    const ctx = this._displayCtx;
    ctx.beginPath();
    ctx.rect(
      this._doSize(width - scrollConfig.width),
      0,
      this._doSize(scrollConfig.width),
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
      this._doSize(height - scrollConfig.width),
      this._doSize(width - scrollConfig.width),
      this._doSize(scrollConfig.width)
    );
    ctx.closePath();
    if (ctx.isPointInPath(this._doSize(p.x), this._doSize(p.y))) {
      return true;
    }
    return false;
  }

  getLineWidth(): number {
    const lineWidth = this._opts.scrollConfig.width;
    return lineWidth;
  }

  calc(position: TypeScreenPosition) {
    const { width, height, scrollConfig } = this._opts;
    const sliderMinSize = scrollConfig.width * 2.5;
    const lineSize = scrollConfig.width;
    let xSize = 0;
    let ySize = 0;
    if (position.left <= 0 && position.right <= 0) {
      xSize = Math.max(
        sliderMinSize,
        width - (Math.abs(position.left) + Math.abs(position.right))
      );
      if (xSize >= width) xSize = 0;
    }
    if (position.top <= 0 || position.bottom <= 0) {
      ySize = Math.max(
        sliderMinSize,
        height - (Math.abs(position.top) + Math.abs(position.bottom))
      );
      if (ySize >= height) ySize = 0;
    }

    let translateX = 0;
    if (xSize > 0) {
      translateX =
        xSize / 2 +
        ((width - xSize) * Math.abs(position.left)) /
          (Math.abs(position.left) + Math.abs(position.right));
      translateX = Math.min(Math.max(0, translateX - xSize / 2), width - xSize);
      // const xUnit = this.calcScreenScrollUnit(position.left, position.right, xSize, width);
      // translateX = translateX * xUnit;
    }

    let translateY = 0;
    if (ySize > 0) {
      translateY =
        ySize / 2 +
        ((height - ySize) * Math.abs(position.top)) /
          (Math.abs(position.top) + Math.abs(position.bottom));
      translateY = Math.min(
        Math.max(0, translateY - ySize / 2),
        height - ySize
      );
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
    const options: TypePrivateOptions = {
      ...opts,
      ...{
        scrollConfig: { ...defaultScrollConfig, ...(opts.scrollConfig || {}) }
      }
    } as TypePrivateOptions;
    if (!options.scrollConfig) {
      options.scrollConfig =
        defaultScrollConfig as TypePrivateOptions['scrollConfig'];
    }
    if (!(options?.scrollConfig?.width > 0)) {
      options.scrollConfig.width = defaultScrollConfig.width;
    }
    options.scrollConfig.width = Math.max(
      options.scrollConfig.width,
      defaultScrollConfig.width
    );

    if (isColorStr(options.scrollConfig.color) !== true) {
      options.scrollConfig.color = options.scrollConfig.color;
    }
    return options;
  }
}

function drawBoxScrollerThumb(
  ctx: CanvasRenderingContext2D,
  opts: {
    axis: 'X' | 'Y';
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
    color: string;
  }
): void {
  let { x, y, h, w } = opts;
  const { color, axis } = opts;
  if (axis === 'X') {
    y = y + h / 4 + 1;
    h = h / 2;
  } else if (axis === 'Y') {
    x = x + w / 4 + 1;
    w = w / 2;
  }

  let r = opts.r;
  r = Math.min(r, w / 2, h / 2);
  if (w < r * 2 || h < r * 2) {
    r = 0;
  }
  ctx.globalAlpha = scrollerThumbAlpha;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}
