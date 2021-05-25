type Options = {
  width: number;
  height: number;
  devicePixelRatio: number;
}

class Context {
  private _opts: Options;
  private _ctx: CanvasRenderingContext2D;

  // private _scale: number;
  // private _scrollX: number;
  // private _scrollY: number;

  constructor(ctx: CanvasRenderingContext2D, opts: Options) {
    this._opts = opts;
    this._ctx = ctx;
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

  isPointInPath(x: number, y: number) {
    return this._ctx.isPointInPath(this._doSize(x), this._doSize(y));
  }

  private _doSize(num: number) {
    return this._opts.devicePixelRatio * num;
  }

}

export default Context;