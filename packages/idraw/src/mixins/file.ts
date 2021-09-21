import { _tempData } from '../names';
import iDraw from './../index';

export async function exportDataURL(
  idraw: iDraw,
  type: 'image/png' | 'image/jpeg',
  quality?: number
): Promise<string> {
  if (idraw[_tempData].get('isDownloading') === true) {
    return Promise.reject('Busy!');
  }

  idraw[_tempData].set('isDownloading', true);
  return new Promise((resolve, reject) => {
    let dataURL: string = '';
    function listenRenderFrameComplete() {
      idraw.off('drawFrameComplete', listenRenderFrameComplete);
      idraw[_tempData].set('isDownloading', false);
      const ctx = idraw.__getOriginContext();
      const canvas = ctx.canvas;
      dataURL = canvas.toDataURL(type, quality);
      resolve(dataURL);
    }
    try {
      idraw.on('drawFrameComplete', listenRenderFrameComplete);
      idraw.clearOperation();
    } catch (err) {
      reject(err);
    }
  });

  

}