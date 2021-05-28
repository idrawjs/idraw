import { TypeContext } from '@idraw/types';

type Options = {
  width: number;
  height: number;
  devicePixelRatio: number;
}

type Transform = {
  scale?: number;
  scrollX?: number;
  scrollY?: number;
}

type PrivateTransform = {
  scale: number;
  scrollX: number;
  scrollY: number;
}

class Context implements TypeContext {
  private _opts: Options;
  private _ctx: CanvasRenderingContext2D;
  private _transform: PrivateTransform; 

  // private _scale: number;
  // private _scrollX: number;
  // private _scrollY: number;

  constructor(ctx: CanvasRenderingContext2D, opts: Options) {
    this._opts = opts;
    this._ctx = ctx;
    this._transform = {
      scale: 1,
      scrollX: 0,
      scrollY: 0,
    }
  }

  getSize() {
    return  {
      width: this._opts.width,
      height: this._opts.height,
      devicePixelRatio: this._opts.devicePixelRatio,
    }
  }

  setTransform(config: Transform) {
    this._transform = {...this._transform, ...config};
  }

  getTransform() {
    return {
      scale: this._transform.scale,
      scrollX: this._transform.scrollX,
      scrollY: this._transform.scrollY,
    }
  }

  setFillStyle(color: string) {
    this._ctx.fillStyle = color;
  }

  fill(fillRule?: CanvasFillRule | undefined) {
    return this._ctx.fill(fillRule);
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean | undefined) {
    return this._ctx.arc(this._doSize(x), this._doSize(y), this._doSize(radius), startAngle, endAngle, anticlockwise);
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

  moveTo(x: number, y: number) {
    return this._ctx.moveTo(this._doSize(x), this._doSize(y));
  }

  setLineWidth(w: number) {
    return this._ctx.lineWidth = this._doSize(w);
  }

  setLineDash(nums: number[]) {
    return this._ctx.setLineDash(nums.map(n => this._doSize(n)));
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

  translate(x: number, y: number) {
    return this._ctx.translate(this._doX(x), this._doY(y));
  }
  
  rotate(angle: number) {
    return this._ctx.rotate(angle)
  }

  private _doSize(num: number) {
    return this._opts.devicePixelRatio * num;
  }

  private _doX(x: number) {
    const { scale, scrollX } = this._transform;
    const _x = (x - scrollX * scale) / scale;
    return this._doSize(_x);
  }

  private _doY(y: number) {
    const { scale, scrollY } = this._transform;
    const _y = (y - scrollY * scale) / scale;
    return this._doSize(_y);
  }

}

export default Context;