import type { ViewContext2D, ViewContext2DOptions } from '@idraw/types';

export class Context2D implements ViewContext2D {
  private _ctx: CanvasRenderingContext2D;

  private _devicePixelRatio = 1;
  // private _width: number = 0;
  // private _height: number = 0;

  constructor(ctx: CanvasRenderingContext2D, opts: ViewContext2DOptions) {
    const { devicePixelRatio = 1 } = opts;
    this._ctx = ctx;
    this._devicePixelRatio = devicePixelRatio;
    // this._width = ctx.canvas.width / devicePixelRatio;
    // this._height = ctx.canvas.height / devicePixelRatio;
  }

  $undoPixelRatio(num: number) {
    return num / this._devicePixelRatio;
  }
  $doPixelRatio(num: number) {
    return this._devicePixelRatio * num;
  }

  $getContext(): CanvasRenderingContext2D {
    return this._ctx;
  }

  $setFont(opts: { fontSize: number; fontFamily?: string; fontWeight?: 'bold' }): void {
    const strList: string[] = [];
    if (opts.fontWeight === 'bold') {
      strList.push(`${opts.fontWeight}`);
    }
    strList.push(`${this.$doPixelRatio(opts.fontSize || 12)}px`);
    strList.push(`${opts.fontFamily || 'sans-serif'}`);
    this._ctx.font = `${strList.join(' ')}`;
  }

  $resize(opts: { width: number; height: number; devicePixelRatio: number }) {
    const { width, height, devicePixelRatio } = opts;
    const { canvas } = this._ctx;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    // canvas.style.width = `${width}px`;
    // canvas.style.height = `${height}px`;
    // this._width = width;
    // this._height = height;
    this._devicePixelRatio = devicePixelRatio;
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
    return this.$undoPixelRatio(this._ctx.lineWidth);
  }
  set lineWidth(w: number) {
    this._ctx.lineWidth = this.$doPixelRatio(w);
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
    return this.$undoPixelRatio(this._ctx.shadowOffsetX);
  }
  set shadowOffsetX(offsetX: number) {
    this._ctx.shadowOffsetX = this.$doPixelRatio(offsetX);
  }

  get shadowOffsetY(): number {
    return this.$undoPixelRatio(this._ctx.shadowOffsetY);
  }
  set shadowOffsetY(offsetY: number) {
    this._ctx.shadowOffsetY = this.$doPixelRatio(offsetY);
  }

  get shadowBlur(): number {
    return this.$undoPixelRatio(this._ctx.shadowBlur);
  }
  set shadowBlur(blur: number) {
    this._ctx.shadowBlur = this.$doPixelRatio(blur);
  }

  fill(...args: [fillRule?: CanvasFillRule | undefined] | [path: Path2D, fillRule?: CanvasFillRule | undefined]): void {
    return this._ctx.fill(...(args as [path: Path2D, fillRule?: CanvasFillRule | undefined]));
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean | undefined): void {
    return this._ctx.arc(this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(radius), startAngle, endAngle, anticlockwise);
  }

  rect(x: number, y: number, w: number, h: number) {
    return this._ctx.rect(this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(w), this.$doPixelRatio(h));
  }

  fillRect(x: number, y: number, w: number, h: number) {
    return this._ctx.fillRect(this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(w), this.$doPixelRatio(h));
  }

  clearRect(x: number, y: number, w: number, h: number) {
    return this._ctx.clearRect(this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(w), this.$doPixelRatio(h));
  }

  beginPath() {
    return this._ctx.beginPath();
  }

  closePath() {
    return this._ctx.closePath();
  }

  lineTo(x: number, y: number) {
    return this._ctx.lineTo(this.$doPixelRatio(x), this.$doPixelRatio(y));
  }

  moveTo(x: number, y: number) {
    return this._ctx.moveTo(this.$doPixelRatio(x), this.$doPixelRatio(y));
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    return this._ctx.arcTo(this.$doPixelRatio(x1), this.$doPixelRatio(y1), this.$doPixelRatio(x2), this.$doPixelRatio(y2), this.$doPixelRatio(radius));
  }

  getLineDash() {
    return this._ctx.getLineDash();
  }

  setLineDash(nums: number[]) {
    return this._ctx.setLineDash(nums.map((n) => this.$doPixelRatio(n)));
  }

  stroke() {
    return this._ctx.stroke();
  }

  translate(x: number, y: number) {
    return this._ctx.translate(this.$doPixelRatio(x), this.$doPixelRatio(y));
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
        this.$doPixelRatio(sx),
        this.$doPixelRatio(sy),
        this.$doPixelRatio(sw),
        this.$doPixelRatio(sh),
        this.$doPixelRatio(dx),
        this.$doPixelRatio(dy),
        this.$doPixelRatio(dw),
        this.$doPixelRatio(dh)
      );
    } else {
      return this._ctx.drawImage(image, this.$doPixelRatio(dx), this.$doPixelRatio(dy), this.$doPixelRatio(dw), this.$doPixelRatio(dh));
    }
  }

  createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null {
    return this._ctx.createPattern(image, repetition);
  }

  measureText(text: string): TextMetrics {
    const textMetrics = this._ctx.measureText(text);
    return textMetrics;
  }

  fillText(text: string, x: number, y: number, maxWidth?: number | undefined): void {
    if (maxWidth !== undefined) {
      return this._ctx.fillText(text, this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(maxWidth));
    } else {
      return this._ctx.fillText(text, this.$doPixelRatio(x), this.$doPixelRatio(y));
    }
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number | undefined): void {
    if (maxWidth !== undefined) {
      return this._ctx.strokeText(text, this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(maxWidth));
    } else {
      return this._ctx.strokeText(text, this.$doPixelRatio(x), this.$doPixelRatio(y));
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
    this._ctx.ellipse(
      this.$doPixelRatio(x),
      this.$doPixelRatio(y),
      this.$doPixelRatio(radiusX),
      this.$doPixelRatio(radiusY),
      rotation,
      startAngle,
      endAngle,
      counterclockwise
    );
  }

  isPointInPath(x: number, y: number) {
    return this._ctx.isPointInPath(this.$doPixelRatio(x), this.$doPixelRatio(y));
  }

  // clip(fillRule?: CanvasFillRule): void;
  // clip(path: Path2D, fillRule?: CanvasFillRule): void;
  clip(...args: [fillRule?: CanvasFillRule | undefined] | [path: Path2D, fillRule?: CanvasFillRule | undefined]) {
    return this._ctx.clip(...(args as any[]));
  }
}
