type ImageType = 'image/jpeg' | 'image/png';

export function downloadImageFromCanvas(canvas: HTMLCanvasElement, opts: { fileName: string; type: ImageType }): void {
  const { fileName, type = 'image/jpeg' } = opts;
  const stream = canvas.toDataURL(type);
  let downloadLink: HTMLAnchorElement | null = document.createElement('a');
  downloadLink.href = stream;
  downloadLink.download = fileName;
  downloadLink.click();
  downloadLink = null;
}

export function pickFile(opts: { accept?: string; success: (data: { file: File }) => void; error?: (err: Error | any) => void }) {
  const { accept, success, error } = opts;
  let input: HTMLInputElement | null = document.createElement('input') as HTMLInputElement;
  input.type = 'file';
  if (accept) {
    input.accept = accept;
  }
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

export function parseTextToBlobURL(text: string) {
  const bytes = new TextEncoder().encode(text);
  const blob = new Blob([bytes], {
    type: 'text/plain;charset=utf-8'
  });
  const blobURL = window.URL.createObjectURL(blob);
  return blobURL;
}

export function downloadFileFromText(text: string, opts: { fileName: string }): void {
  const { fileName } = opts;
  const blobURL = parseTextToBlobURL(text);
  let downloadLink: HTMLAnchorElement | null = document.createElement('a');
  downloadLink.href = blobURL;
  downloadLink.download = fileName;
  downloadLink.click();
  downloadLink = null;
}
