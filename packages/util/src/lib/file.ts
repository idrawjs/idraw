type ImageType = 'image/jpeg' | 'image/png';

export function downloadImageFromCanvas(canvas: HTMLCanvasElement, opts: { filename: string; type: ImageType }): void {
  const { filename, type = 'image/jpeg' } = opts;
  const stream = canvas.toDataURL(type);
  const downloadLink = document.createElement('a');
  downloadLink.href = stream;
  downloadLink.download = filename;
  const downloadClickEvent = document.createEvent('MouseEvents');
  downloadClickEvent.initEvent('click', true, false);
  downloadLink.dispatchEvent(downloadClickEvent);
}

export function pickFile(opts: { success: (data: { file: File }) => void; error?: (err: ErrorEvent) => void }) {
  const { success, error } = opts;
  let input: HTMLInputElement | null = document.createElement('input') as HTMLInputElement;
  input.type = 'file';
  input.addEventListener('change', function () {
    const file: File = (input as HTMLInputElement).files?.[0] as File;
    success({
      file: file
    });
    input = null;
  });
  input.addEventListener('error', function (err) {
    if (typeof error === 'function') {
      error(err);
    }
    input = null;
  });
  input.click();
}

export function parseFileToBase64(file: File): Promise<string | ArrayBuffer> {
  return new Promise(function (resolve, reject) {
    let reader: any = new FileReader();
    reader.addEventListener('load', function () {
      resolve(reader.result);
      reader = null;
    });
    reader.addEventListener('error', function (err: Error) {
      // reader.abort();
      reject(err);
      reader = null;
    });
    reader.addEventListener('abort', function () {
      reject(new Error('abort'));
      reader = null;
    });
    reader.readAsDataURL(file);
  });
}

export function parseFileToText(file: File): Promise<string | ArrayBuffer> {
  return new Promise(function (resolve, reject) {
    let reader: any = new FileReader();
    reader.addEventListener('load', function () {
      resolve(reader.result);
      reader = null;
    });
    reader.addEventListener('error', function (err: Error) {
      // reader.abort();
      reject(err);
      reader = null;
    });
    reader.addEventListener('abort', function () {
      reject(new Error('abort'));
      reader = null;
    });
    reader.readAsText(file);
  });
}
