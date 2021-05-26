import { TypeContext } from '@idraw/types';

type Options = {
  width: number;
  height: number;
  devicePixelRatio: number;
}

type Config = {
  scale?: number;
  scrollX?: number;
  scrollY?: number;
}

type PrivateConfig = {
  scale: number;
  scrollX: number;
  scrollY: number;
}

class Context implements TypeContext {
  private _opts: Options;
  private _ctx: CanvasRenderingContext2D;
  private _conf: PrivateConfig; 

  // private _scale: number;
  // private _scrollX: number;
  // private _scrollY: number;

  constructor(ctx: CanvasRenderingContext2D, opts: Options) {
    this._opts = opts;
    this._ctx = ctx;
    this._conf = {
      scale: 1,
      scrollX: 0,
      scrollY: 0,
    }
  }

  setConfig(config: Config) {
    this._conf = {...this._conf, ...config};
  }

  setFillStyle(color: string) {
    this._ctx.fillStyle = color;
  }

  fillRect(x: number, y: number, w: number, h: number) {
    return this._ctx.fillRect(
      this._doSize(x), 
      this._doSize(y),
      this._doSize(w),
      this._doSize(h)
    );
  }

  clearRect(x: number, y: number, w: number, h: number) {
    return this._ctx.clearRect(
      this._doSize(x), 
      this._doSize(y),
      this._doSize(w),
      this._doSize(h)
    );
  }

  beginPath() {
    return this._ctx.beginPath();
  }

  closePath() {
    return this._ctx.closePath();
  }

  lineTo(x: number, y: number) {
    return this._ctx.lineTo(this._doSize(x), this._doSize(y));
  }

  setLineWidth(w: number) {
    this._ctx.lineWidth = w;
  }

  isPointInPath(x: number, y: number) {
    return this._ctx.isPointInPath(this._doX(x), this._doY(y));
  }

  setStrokeStyle(color: string) {
    this._ctx.strokeStyle = color;
  }

  stroke() {
    return this._ctx.stroke();
  }

  private _doSize(num: number) {
    return this._opts.devicePixelRatio * num;
  }

  private _doX(x: number) {
    const { scale, scrollX } = this._conf;
    const _x = (x - scrollX * scale) / scale;
    return this._doSize(_x);
  }

  private _doY(y: number) {
    const { scale, scrollY } = this._conf;
    const _y = (y - scrollY * scale) / scale;
    return this._doSize(_y);
  }

}

export default Context;