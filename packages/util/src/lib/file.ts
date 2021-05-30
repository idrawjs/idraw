
type ImageType = 'image/jpeg' | 'image/png';

export function downloadImageFromCanvas (
  canvas: HTMLCanvasElement, 
  opts: { filename: string, type: ImageType }
): void {
  const { filename, type = 'image/jpeg' } = opts;
  const stream = canvas.toDataURL(type);
  const downloadLink = document.createElement('a');
  downloadLink.href = stream;
  downloadLink.download = filename;
  const downloadClickEvent = document.createEvent('MouseEvents');
  downloadClickEvent.initEvent('click', true, false);
  downloadLink.dispatchEvent(downloadClickEvent);
}