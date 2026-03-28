export function compressImage(
  src: string,
  opts?: { radio?: number; type?: 'image/jpeg' | 'image/png' }
): Promise<string> {
  let radio = 0.5;
  const type = opts?.type || 'image/png';
  if (opts?.radio && opts?.radio > 0 && opts?.radio <= 1) {
    radio = opts?.radio;
  }
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => {
      const { width, height } = img;
      const resultW = width * radio;
      const resultH = height * radio;
      let canvas: null | HTMLCanvasElement = document.createElement('canvas');
      canvas.width = resultW;
      canvas.height = resultH;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.drawImage(img, 0, 0, resultW, resultH);
      const base64 = canvas.toDataURL(type);
      canvas = null;
      resolve(base64);
    });
    img.addEventListener('error', (err) => {
      reject(err);
    });
    img.src = src;
  });
}
