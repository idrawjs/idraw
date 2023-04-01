import iDraw from './../index';

export async function exportDataURL(
  idraw: iDraw,
  type: 'image/png' | 'image/jpeg',
  quality?: number
): Promise<string> {
  if (idraw.getTempData().get('isDownloading') === true) {
    return Promise.reject('Busy!');
  }

  idraw.getTempData().set('isDownloading', true);
  return new Promise((resolve, reject) => {
    let dataURL = '';
    function listenRenderFrameComplete() {
      idraw.off('drawFrameComplete', listenRenderFrameComplete);
      idraw.getTempData().set('isDownloading', false);
      const ctx = idraw.$getOriginContext2D();
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

export function toDataURL(
  idraw: iDraw,
  type: 'image/png' | 'image/jpeg',
  quality?: number
): string {
  const ctx = idraw.$getOriginContext2D();
  const canvas = ctx.canvas;
  const dataURL: string = canvas.toDataURL(type, quality);
  return dataURL;
}
