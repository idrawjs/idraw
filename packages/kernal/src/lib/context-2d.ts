// import { TypeContext, TypeBoardSizeOptions } from '@idraw/types';

interface CanvasRenderingContext2D extends 
   
  CanvasText, 
  CanvasTextDrawingStyles, 
  CanvasTransform, 
  CanvasUserInterface {};


type ContextRecord = {
  name: string,
  type: 'attr' | 'method',
  args: any[]
}

type ContextAttr = {
  globalAlpha?: number;
  globalCompositeOperation?: string;
}

class Context2d {

  private _records: ContextRecord[];
  private _attrs: ContextAttr = {};

  constructor() {
    this._records = [];
  }

  // CanvasCompositing
  get globalAlpha (): number | undefined {
    return this._attrs['globalAlpha'];
  }
  set globalAlpha(value: number | undefined) {
    this._attrs['globalAlpha'] = value;
    this._records.push({
      name: 'globalAlpha',
      type: 'attr',
      args: [value]
    })
  }
  get globalCompositeOperation (): string | undefined {
    return this._attrs['globalCompositeOperation'];
  }
  set globalCompositeOperation(value: string | undefined) {
    // source-over source-in source-out source-atop destination-over destination-in destination-out destination-atop lighter copy xor multiply screen overlay darken lighten color-dodge color-burn hard-light soft-light difference exclusion hue saturation color luminosity 
    this._attrs['globalCompositeOperation'] = value;
    this._records.push({
      name: 'globalCompositeOperation',
      type: 'attr',
      args: [value]
    })
  }
  
  // CanvasDrawImage
  drawImage(
    image: CanvasImageSource, sx: number, sy: number, 
    sw?: number, sh?: number, dx?: number, dy?: number, dw?: number, dh?: number
  ): void{
    const args = Array.from(arguments);
    this._records.push({
      name: 'drawImage',
      type: 'method',
      args: args,
    });
  }

  // CanvasDrawPath {
  //   beginPath(): void;
  //   clip(fillRule?: CanvasFillRule): void;
  //   clip(path: Path2D, fillRule?: CanvasFillRule): void;
  //   fill(fillRule?: CanvasFillRule): void;
  //   fill(path: Path2D, fillRule?: CanvasFillRule): void;
  //   isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
  //   isPointInPath(path: Path2D, x: number, y: number, fillRule?: CanvasFillRule): boolean;
  //   isPointInStroke(x: number, y: number): boolean;
  //   isPointInStroke(path: Path2D, x: number, y: number): boolean;
  //   stroke(): void;
  //   stroke(path: Path2D): void;
  // }

  // CanvasFillStrokeStyles {
  //   fillStyle: string | CanvasGradient | CanvasPattern;
  //   strokeStyle: string | CanvasGradient | CanvasPattern;
  //   createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
  //   createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null;
  //   createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
  // }

  // CanvasFilters {
  //   filter: string;
  // }

  // CanvasImageData {
  //   createImageData(sw: number, sh: number, settings?: ImageDataSettings): ImageData;
  //   createImageData(imagedata: ImageData): ImageData;
  //   getImageData(sx: number, sy: number, sw: number, sh: number, settings?: ImageDataSettings): ImageData;
  //   putImageData(imagedata: ImageData, dx: number, dy: number): void;
  //   putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;
  // }

  // CanvasImageSmoothing {
  //   imageSmoothingEnabled: boolean;
  //   imageSmoothingQuality: ImageSmoothingQuality;
  // }


  // CanvasPath {
  //   arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  //   arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  //   bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  //   closePath(): void;
  //   ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  //   lineTo(x: number, y: number): void;
  //   moveTo(x: number, y: number): void;
  //   quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  //   rect(x: number, y: number, w: number, h: number): void;
  // }

  // CanvasPathDrawingStyles {
  //   lineCap: CanvasLineCap;
  //   lineDashOffset: number;
  //   lineJoin: CanvasLineJoin;
  //   lineWidth: number;
  //   miterLimit: number;
  //   getLineDash(): number[];
  //   setLineDash(segments: number[]): void;
  // }

  // CanvasRect {
  //   clearRect(x: number, y: number, w: number, h: number): void;
  //   fillRect(x: number, y: number, w: number, h: number): void;
  //   strokeRect(x: number, y: number, w: number, h: number): void;
  // }

  // CanvasShadowStyles {
  //   shadowBlur: number;
  //   shadowColor: string;
  //   shadowOffsetX: number;
  //   shadowOffsetY: number;
  // }

  // CanvasState {
  //   restore(): void;
  //   save(): void;
  // }
  

  // Additional methods
  $getAllRecords(): ContextRecord[] {
    return this._records;
  }

  $getAllAttrs() {
    return this._attrs;
  }


  // globalAlpha: number;
  // globalCompositeOperation: string;
}

export default Context2d;



