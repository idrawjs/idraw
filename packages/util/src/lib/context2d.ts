import type { ViewContext2D, ViewContext2DOptions } from '@idraw/types';

export class Context2D implements ViewContext2D {
  #ctx: CanvasRenderingContext2D;
  #opts: Required<ViewContext2DOptions>;

  // private _width: number = 0;
  // private _height: number = 0;

  constructor(ctx: CanvasRenderingContext2D | OffscreenRenderingContext, opts: ViewContext2DOptions) {
    this.#ctx = ctx as CanvasRenderingContext2D;
    this.#opts = { ...{ devicePixelRatio: 1, offscreenCanvas: null }, ...opts };
    // this._width = ctx.canvas.width / devicePixelRatio;
    // this._height = ctx.canvas.height / devicePixelRatio;
  }

  $undoPixelRatio(num: number) {
    return num / this.#opts.devicePixelRatio;
  }
  $doPixelRatio(num: number) {
    return this.#opts.devicePixelRatio * num;
  }

  $getContext(): CanvasRenderingContext2D {
    return this.#ctx;
  }

  $setFont(opts: { fontSize: number; fontFamily?: string; fontWeight?: 'bold' | number | string }): void {
    const strList: string[] = [];
    if (opts.fontWeight) {
      strList.push(`${opts.fontWeight}`);
    }
    strList.push(`${this.$doPixelRatio(opts.fontSize || 12)}px`);
    strList.push(`${opts.fontFamily || 'sans-serif'}`);
    this.#ctx.font = `${strList.join(' ')}`;
  }

  $getOffscreenCanvas(): OffscreenCanvas | null {
    return this.#opts.offscreenCanvas;
  }

  $resize(opts: { width: number; height: number; devicePixelRatio: number; resetStyle?: boolean }) {
    const { width, height, devicePixelRatio, resetStyle } = opts;
    const { canvas } = this.#ctx;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    this.#opts = {
      ...this.#opts,
      ...{
        devicePixelRatio
      }
    };
    if (resetStyle === true) {
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
  }

  $getSize(): { width: number; height: number; devicePixelRatio: number } {
    const { devicePixelRatio } = this.#opts;
    const { width, height } = this.#ctx.canvas;
    return {
      width: width / devicePixelRatio,
      height: height / devicePixelRatio,
      devicePixelRatio
    };
  }

  get canvas() {
    return this.#ctx.canvas;
  }

  get fillStyle() {
    return this.#ctx.fillStyle;
  }
  set fillStyle(value: string | CanvasGradient | CanvasPattern) {
    this.#ctx.fillStyle = value;
  }

  get strokeStyle() {
    return this.#ctx.strokeStyle;
  }
  set strokeStyle(color: string | CanvasGradient | CanvasPattern) {
    this.#ctx.strokeStyle = color;
  }

  get lineWidth() {
    return this.$undoPixelRatio(this.#ctx.lineWidth);
  }
  set lineWidth(w: number) {
    this.#ctx.lineWidth = this.$doPixelRatio(w);
  }

  get textAlign(): CanvasTextAlign {
    return this.#ctx.textAlign;
  }
  set textAlign(align: CanvasTextAlign) {
    this.#ctx.textAlign = align;
  }

  get textBaseline() {
    return this.#ctx.textBaseline;
  }
  set textBaseline(baseline: CanvasTextBaseline) {
    this.#ctx.textBaseline = baseline;
  }

  get globalAlpha() {
    return this.#ctx.globalAlpha;
  }
  set globalAlpha(alpha: number) {
    this.#ctx.globalAlpha = alpha;
  }
  get shadowColor(): string {
    return this.#ctx.shadowColor;
  }
  set shadowColor(color: string) {
    this.#ctx.shadowColor = color;
  }

  get shadowOffsetX() {
    return this.$undoPixelRatio(this.#ctx.shadowOffsetX);
  }
  set shadowOffsetX(offsetX: number) {
    this.#ctx.shadowOffsetX = this.$doPixelRatio(offsetX);
  }

  get shadowOffsetY(): number {
    return this.$undoPixelRatio(this.#ctx.shadowOffsetY);
  }
  set shadowOffsetY(offsetY: number) {
    this.#ctx.shadowOffsetY = this.$doPixelRatio(offsetY);
  }

  get shadowBlur(): number {
    return this.$undoPixelRatio(this.#ctx.shadowBlur);
  }
  set shadowBlur(blur: number) {
    this.#ctx.shadowBlur = this.$doPixelRatio(blur);
  }

  get lineCap() {
    return this.#ctx.lineCap;
  }
  set lineCap(lineCap: CanvasLineCap) {
    this.#ctx.lineCap = lineCap;
  }

  get globalCompositeOperation(): GlobalCompositeOperation {
    return this.#ctx.globalCompositeOperation;
  }

  set globalCompositeOperation(operations: GlobalCompositeOperation) {
    this.#ctx.globalCompositeOperation = operations;
  }

  fill(...args: [fillRule?: CanvasFillRule | undefined] | [path: Path2D, fillRule?: CanvasFillRule | undefined]): void {
    return this.#ctx.fill(...(args as [path: Path2D, fillRule?: CanvasFillRule | undefined]));
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean | undefined): void {
    return this.#ctx.arc(this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(radius), startAngle, endAngle, anticlockwise);
  }

  rect(x: number, y: number, w: number, h: number) {
    return this.#ctx.rect(this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(w), this.$doPixelRatio(h));
  }

  fillRect(x: number, y: number, w: number, h: number) {
    return this.#ctx.fillRect(this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(w), this.$doPixelRatio(h));
  }

  clearRect(x: number, y: number, w: number, h: number) {
    return this.#ctx.clearRect(this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(w), this.$doPixelRatio(h));
  }

  beginPath() {
    return this.#ctx.beginPath();
  }

  closePath() {
    return this.#ctx.closePath();
  }

  lineTo(x: number, y: number) {
    return this.#ctx.lineTo(this.$doPixelRatio(x), this.$doPixelRatio(y));
  }

  moveTo(x: number, y: number) {
    return this.#ctx.moveTo(this.$doPixelRatio(x), this.$doPixelRatio(y));
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    return this.#ctx.arcTo(this.$doPixelRatio(x1), this.$doPixelRatio(y1), this.$doPixelRatio(x2), this.$doPixelRatio(y2), this.$doPixelRatio(radius));
  }

  getLineDash() {
    return this.#ctx.getLineDash();
  }

  setLineDash(nums: number[]) {
    const dash = nums.map((n) => this.$doPixelRatio(n));
    return this.#ctx.setLineDash(dash);
  }

  stroke(path?: Path2D) {
    return path ? this.#ctx.stroke(path) : this.#ctx.stroke();
  }

  translate(x: number, y: number) {
    return this.#ctx.translate(this.$doPixelRatio(x), this.$doPixelRatio(y));
  }

  rotate(angle: number) {
    return this.#ctx.rotate(angle);
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
      return this.#ctx.drawImage(
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
      return this.#ctx.drawImage(image, this.$doPixelRatio(dx), this.$doPixelRatio(dy), this.$doPixelRatio(dw), this.$doPixelRatio(dh));
    }
  }

  createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null {
    return this.#ctx.createPattern(image, repetition);
  }

  measureText(text: string): TextMetrics {
    const textMetrics = this.#ctx.measureText(text);
    return textMetrics;
  }

  fillText(text: string, x: number, y: number, maxWidth?: number | undefined): void {
    if (maxWidth !== undefined) {
      return this.#ctx.fillText(text, this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(maxWidth));
    } else {
      return this.#ctx.fillText(text, this.$doPixelRatio(x), this.$doPixelRatio(y));
    }
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number | undefined): void {
    if (maxWidth !== undefined) {
      return this.#ctx.strokeText(text, this.$doPixelRatio(x), this.$doPixelRatio(y), this.$doPixelRatio(maxWidth));
    } else {
      return this.#ctx.strokeText(text, this.$doPixelRatio(x), this.$doPixelRatio(y));
    }
  }

  save() {
    this.#ctx.save();
  }

  restore() {
    this.#ctx.restore();
  }

  scale(ratioX: number, ratioY: number) {
    this.#ctx.scale(ratioX, ratioY);
  }

  circle(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean | undefined
  ) {
    this.#ctx.ellipse(
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
    return this.#ctx.isPointInPath(this.$doPixelRatio(x), this.$doPixelRatio(y));
  }

  // clip(fillRule?: CanvasFillRule): void;
  // clip(path: Path2D, fillRule?: CanvasFillRule): void;
  clip(...args: [fillRule?: CanvasFillRule | undefined] | [path: Path2D, fillRule?: CanvasFillRule | undefined]) {
    return this.#ctx.clip(...(args as any[]));
  }

  setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
    return this.#ctx.setTransform(a, b, c, d, e, f);
  }
  getTransform(): DOMMatrix2DInit {
    return this.#ctx.getTransform();
  }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
    return this.#ctx.createLinearGradient(this.$doPixelRatio(x0), this.$doPixelRatio(y0), this.$doPixelRatio(x1), this.$doPixelRatio(y1));
  }
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient {
    return this.#ctx.createRadialGradient(
      this.$doPixelRatio(x0),
      this.$doPixelRatio(y0),
      this.$doPixelRatio(r0),
      this.$doPixelRatio(x1),
      this.$doPixelRatio(y1),
      this.$doPixelRatio(r1)
    );
  }
  createConicGradient(startAngle: number, x: number, y: number): CanvasGradient {
    return this.#ctx.createConicGradient(startAngle, this.$doPixelRatio(x), this.$doPixelRatio(y));
  }
}
