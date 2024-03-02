export interface ViewContext2DOptions {
  devicePixelRatio?: number;
  offscreenCanvas?: OffscreenCanvas | null;
}

export interface ViewContext2D {
  // font: string;

  // extend API
  $getContext(): CanvasRenderingContext2D;
  $setContext(ctx: CanvasRenderingContext2D): void;
  $resetFont(): void;
  $setFont(opts: { fontSize: number; fontFamily?: string; fontWeight?: string | number }): void;
  $resize(opts: { width: number; height: number; devicePixelRatio: number }): void;
  $getSize(): { width: number; height: number; devicePixelRatio: number };
  $getOffscreenCanvas(): OffscreenCanvas | null;
  $undoPixelRatio(num: number): number;
  $doPixelRatio(num: number): number;

  // CanvasRenderingContext2D API
  canvas: HTMLCanvasElement;
  fillStyle: string | CanvasGradient | CanvasPattern;
  fill(fillRule?: CanvasFillRule): void;
  fill(path: Path2D, fillRule?: CanvasFillRule): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  lineWidth: number;
  getLineDash(): number[];
  setLineDash(segments: number[]): void;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  stroke(): void;
  stroke(path: Path2D): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  measureText(text: string): TextMetrics;
  textAlign: CanvasTextAlign;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
  textBaseline: CanvasTextBaseline;
  restore(): void;
  save(): void;
  scale(x: number, y: number): void;
  drawImage(image: CanvasImageSource, dx: number, dy: number): void;
  drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
  drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
  createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null;
  globalAlpha: number;
  globalCompositeOperation: GlobalCompositeOperation;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  circle(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
  clip(fillRule?: CanvasFillRule): void;
  clip(path: Path2D, fillRule?: CanvasFillRule): void;
  lineCap: CanvasLineCap;
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  getTransform(): DOMMatrix2DInit;
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
  createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
}
