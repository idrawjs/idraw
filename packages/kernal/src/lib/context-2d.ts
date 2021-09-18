// import { TypeContext, TypeBoardSizeOptions } from '@idraw/types';

interface CanvasRenderingContext2D extends 
  // CanvasCompositing,  // OK
  // CanvasDrawImage,  // OK
  CanvasDrawPath,
  CanvasFillStrokeStyles, 
  CanvasFilters, 
  CanvasImageData, 
  CanvasImageSmoothing, 
  CanvasPath, 
  CanvasPathDrawingStyles, 
  CanvasRect, 
  CanvasShadowStyles, 
  CanvasState, 
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

  // source-over source-in source-out source-atop destination-over destination-in destination-out destination-atop lighter copy xor multiply screen overlay darken lighten color-dodge color-burn hard-light soft-light difference exclusion hue saturation color luminosity 
  set globalCompositeOperation(value: string | undefined) {
    this._attrs['globalCompositeOperation'] = value;
    this._records.push({
      name: 'globalCompositeOperation',
      type: 'attr',
      args: [value]
    })
  }

  
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

  // drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void {
  // }
  

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



