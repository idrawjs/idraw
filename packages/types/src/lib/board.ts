type TypePoint = {
  x: number;
  y: number;
}

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
  fillRect(x: number, y: number, w: number, h: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  beginPath(): void;
  closePath(): void;
  lineTo(x: number, y: number): void;
  setLineWidth(w: number): void;
  isPointInPath(x: number, y: number): boolean;
  setStrokeStyle(color: string): void;
  stroke(): void;
}

export {
  TypePoint,
  TypeContext
}