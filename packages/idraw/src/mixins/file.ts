import util from '@idraw/util';
import iDraw from './../index';


export async function exportDataURL(
  idraw: iDraw,
  type: 'image/png' | 'image/jpeg',
  quality?: number
): Promise<string> {
  idraw.clearOperation();
  // TODO 
  // It Needs to listen the end of rendering
  // It uses the delay function to simulate the end of rendering
  await util.time.delay(300);
  const ctx = idraw.__getOriginContext();
  const canvas = ctx.canvas;
  const dataURL = canvas.toDataURL(type, quality);
  return dataURL;
}