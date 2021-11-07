import { TypeContext } from './context';

export interface TypePlugin {
  drawTopContext?(ctx: TypeContext): void;
  drawTopDisplayContext?(ctx2d: CanvasRenderingContext2D): void;
  drawBottomDisplayContext?(ctx2d: CanvasRenderingContext2D): void;
}