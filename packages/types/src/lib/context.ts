interface TypeContext {
  setTransform(config: {
    scale?: number;
    scrollX?: number;
    scrollY?: number;
  }): void;
  getTransform(): {
    scale: number;
    scrollX: number;
    scrollY: number;
  }
  getSize(): {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
  setFillStyle(color: string): void;
  fill(fillRule?: CanvasFillRule | undefined): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean | undefined): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  setLineWidth(w: number): void;
  setLineDash(nums: number[]): void;
  isPointInPath(x: number, y: number): boolean;
  setStrokeStyle(color: string): void;
  stroke(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
}

export {
  TypeContext
};