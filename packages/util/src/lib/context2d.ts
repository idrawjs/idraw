import type { ViewContext2D, ViewContext2DOptions } from '@idraw/types';

export class Context2D implements ViewContext2D {
  private _opts: ViewContext2DOptions;
  private _ctx: CanvasRenderingContext2D;

  // private _scale: number;
  // private _scrollX: number;
  // private _scrollY: number;

  constructor(ctx: CanvasRenderingContext2D, opts: ViewContext2DOptions) {
    const _opts = { ...opts };
    if (!(_opts.devicePixelRatio > 0)) {
      _opts.devicePixelRatio = 1;
    } else {
      _opts.devicePixelRatio = _opts.devicePixelRatio;
    }
    this._opts = opts;
    this._ctx = ctx;
  }

  private _undoSize(num: number) {
    return this._opts.devicePixelRatio / num;
  }
  private _doSize(num: number) {
    return this._opts.devicePixelRatio * num;
  }

  $getContext(): CanvasRenderingContext2D {
    return this._ctx;
  }

  $setFont(opts: { fontSize: number; fontFamily?: string; fontWeight?: 'bold' }): void {
    const strList: string[] = [];
    if (opts.fontWeight === 'bold') {
      strList.push(`${opts.fontWeight}`);
    }
    strList.push(`${this._doSize(opts.fontSize || 12)}px`);
    strList.push(`${opts.fontFamily || 'sans-serif'}`);
    this._ctx.font = `${strList.join(' ')}`;
  }

  get canvas() {
    return this._ctx.canvas;
  }

  get fillStyle() {
    return this._ctx.fillStyle;
  }
  set fillStyle(value: string | CanvasGradient | CanvasPattern) {
    this._ctx.fillStyle = value;
  }

  get strokeStyle() {
    return this._ctx.strokeStyle;
  }
  set strokeStyle(color: string | CanvasGradient | CanvasPattern) {
    this._ctx.strokeStyle = color;
  }

  get lineWidth() {
    return this._undoSize(this._ctx.lineWidth);
  }
  set lineWidth(w: number) {
    this._ctx.lineWidth = this._doSize(w);
  }

  get textAlign(): CanvasTextAlign {
    return this._ctx.textAlign;
  }
  set textAlign(align: CanvasTextAlign) {
    this._ctx.textAlign = align;
  }

  get textBaseline() {
    return this._ctx.textBaseline;
  }
  set textBaseline(baseline: CanvasTextBaseline) {
    this._ctx.textBaseline = baseline;
  }

  get globalAlpha() {
    return this._ctx.globalAlpha;
  }
  set globalAlpha(alpha: number) {
    this._ctx.globalAlpha = alpha;
  }
  get shadowColor(): string {
    return this._ctx.shadowColor;
  }
  set shadowColor(color: string) {
    this._ctx.shadowColor = color;
  }

  get shadowOffsetX() {
    return this._undoSize(this._ctx.shadowOffsetX);
  }
  set shadowOffsetX(offsetX: number) {
    this._ctx.shadowOffsetX = this._doSize(offsetX);
  }

  get shadowOffsetY(): number {
    return this._undoSize(this._ctx.shadowOffsetY);
  }
  set shadowOffsetY(offsetY: number) {
    this._ctx.shadowOffsetY = this._doSize(offsetY);
  }

  get shadowBlur(): number {
    return this._undoSize(this._ctx.shadowBlur);
  }
  set shadowBlur(blur: number) {
    this._ctx.shadowBlur = this._doSize(blur);
  }

  fill(...args: [fillRule?: CanvasFillRule | undefined] | [path: Path2D, fillRule?: CanvasFillRule | undefined]): void {
    return this._ctx.fill(...(args as [path: Path2D, fillRule?: CanvasFillRule | undefined]));
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean | undefined): void {
    return this._ctx.arc(this._doSize(x), this._doSize(y), this._doSize(radius), startAngle, endAngle, anticlockwise);
  }

  rect(x: number, y: number, w: number, h: number) {
    return this._ctx.rect(this._doSize(x), this._doSize(y), this._doSize(w), this._doSize(h));
  }

  fillRect(x: number, y: number, w: number, h: number) {
    return this._ctx.fillRect(this._doSize(x), this._doSize(y), this._doSize(w), this._doSize(h));
  }

  clearRect(x: number, y: number, w: number, h: number) {
    return this._ctx.clearRect(this._doSize(x), this._doSize(y), this._doSize(w), this._doSize(h));
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

  getLineDash() {
    return this._ctx.getLineDash();
  }

  setLineDash(nums: number[]) {
    return this._ctx.setLineDash(nums.map((n) => this._doSize(n)));
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
      return this._ctx.drawImage(
        image,
        this._doSize(sx),
        this._doSize(sy),
        this._doSize(sw),
        this._doSize(sh),
        this._doSize(dx),
        this._doSize(dy),
        this._doSize(dw),
        this._doSize(dh)
      );
    } else {
      return this._ctx.drawImage(image, this._doSize(dx), this._doSize(dy), this._doSize(dw), this._doSize(dh));
    }
  }

  createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null {
    return this._ctx.createPattern(image, repetition);
  }

  measureText(text: string): TextMetrics {
    return this._ctx.measureText(text);
  }

  fillText(text: string, x: number, y: number, maxWidth?: number | undefined): void {
    if (maxWidth !== undefined) {
      return this._ctx.fillText(text, this._doSize(x), this._doSize(y), this._doSize(maxWidth));
    } else {
      return this._ctx.fillText(text, this._doSize(x), this._doSize(y));
    }
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number | undefined): void {
    if (maxWidth !== undefined) {
      return this._ctx.strokeText(text, this._doSize(x), this._doSize(y), this._doSize(maxWidth));
    } else {
      return this._ctx.strokeText(text, this._doSize(x), this._doSize(y));
    }
  }

  save() {
    this._ctx.save();
  }

  restore() {
    this._ctx.restore();
  }

  scale(ratioX: number, ratioY: number) {
    this._ctx.scale(ratioX, ratioY);
  }

  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean | undefined
  ) {
    this._ctx.ellipse(this._doSize(x), this._doSize(y), this._doSize(radiusX), this._doSize(radiusY), rotation, startAngle, endAngle, counterclockwise);
  }

  isPointInPath(x: number, y: number) {
    return this._ctx.isPointInPath(this._doSize(x), this._doSize(y));
  }
}
