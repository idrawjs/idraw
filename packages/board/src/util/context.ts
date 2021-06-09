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
    };
  }

  calcDeviceNum(num: number): number {
    return num * this._opts.devicePixelRatio;
  }

  calcScreenNum(num: number): number {
    return num / this._opts.devicePixelRatio;
  }

  getSize() {
    return  {
      width: this._opts.width,
      height: this._opts.height,
      devicePixelRatio: this._opts.devicePixelRatio,
    };
  }

  setTransform(config: Transform) {
    this._transform = {...this._transform, ...config};
  }

  getTransform() {
    return {
      scale: this._transform.scale,
      scrollX: this._transform.scrollX,
      scrollY: this._transform.scrollY,
    };
  }

  setFillStyle(color: string | CanvasPattern) {
    this._ctx.fillStyle = color;
  }

  fill(fillRule?: CanvasFillRule | undefined) {
    return this._ctx.fill(fillRule || 'nonzero');
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean | undefined): void {
    return this._ctx.arc(this._doSize(x), this._doSize(y), this._doSize(radius), startAngle, endAngle, anticlockwise);
  }

  rect(x: number, y: number, w: number, h: number) {
    return this._ctx.rect(this._doSize(x), this._doSize(y), this._doSize(w), this._doSize(h));
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

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    return this._ctx.arcTo(this._doSize(x1), this._doSize(y1), this._doSize(x2), this._doSize(y2), this._doSize(radius));
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
    return this._ctx.translate(this._doSize(x), this._doSize(y));
  }
  
  rotate(angle: number) {
    return this._ctx.rotate(angle);
  }

  drawImage(...args: any[]) {
    const image: CanvasImageSource = args[0];
    const sx: number = args[1];
    const sy: number = args[2];
    const sw: number = args[3];
    const sh: number = args[4];

    const dx: number = args[args.length - 4];
    const dy: number = args[args.length - 3];
    const dw: number = args[args.length - 2];
    const dh: number = args[args.length - 1];

    if (args.length === 9) {
      return this._ctx.drawImage(image, this._doSize(sx), this._doSize(sy), this._doSize(sw), this._doSize(sh), this._doSize(dx), this._doSize(dy), this._doSize(dw), this._doSize(dh));
    } else {
      return this._ctx.drawImage(image,this._doSize(dx), this._doSize(dy), this._doSize(dw), this._doSize(dh));
    }
  }

  createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null {
    return this._ctx.createPattern(image, repetition)
  }

  measureText(text: string): TextMetrics {
    return this._ctx.measureText(text);
  }

  setTextAlign(align: CanvasTextAlign): void {
    this._ctx.textAlign = align;
  }

  fillText(text: string, x: number, y: number, maxWidth?: number | undefined): void {
    if (maxWidth !== undefined) {
      return this._ctx.fillText(text, this._doSize(x), this._doSize(y), this._doSize(maxWidth));
    } else {
      return this._ctx.fillText(text, this._doSize(x), this._doSize(y));
    }
  }

  setFont(opts: { fontSize: number, fontFamily?: string, fontWeight?: string }): void {
    const strList: string[] = [];
    if (opts.fontWeight) {
      strList.push(`${opts.fontWeight}`);
    }
    strList.push(`${this._doSize(opts.fontSize || 12)}px`);
    strList.push(`${opts.fontFamily || 'sans-serif'}`);
    this._ctx.font = `${strList.join(' ')}`;
    // console.log('this._ctx.font =',this._ctx.font);
  }

  setTextBaseline(baseline: CanvasTextBaseline): void {
    this._ctx.textBaseline = baseline;
  }

  private _doSize(num: number) {
    return this._opts.devicePixelRatio * num;
  }

  private _doX(x: number) {
    const { scale, scrollX } = this._transform;
    const _x = (x - scrollX) / scale;
    return this._doSize(_x);
  }

  private _doY(y: number) {
    const { scale, scrollY } = this._transform;
    const _y = (y - scrollY) / scale;
    return this._doSize(_y);
  }

}

export default Context;