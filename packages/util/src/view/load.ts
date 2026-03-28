import { parseXMLToDataURL, parseSVGCodeToDataURL } from './parser';
const { Image } = window;

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // img.setAttribute('crossOrigin', 'anonymous');
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      resolve(img);
    };
    img.onabort = reject;
    img.onerror = reject;
    img.src = src;
  });
}

export async function loadSVGCode(code: string): Promise<HTMLImageElement> {
  const dataURL = await parseSVGCodeToDataURL(code);
  const image = await loadImage(dataURL);
  return image;
}

function filterAmpersand(str: string): string {
  return str.replace(/&/gi, '&amp;');
}

export async function loadForeignObject(
  content: string,
  opts: { width: number; height: number }
): Promise<HTMLImageElement> {
  content = filterAmpersand(content);
  const dataURL = await parseXMLToDataURL(content, opts);
  const image = await loadImage(dataURL);
  return image;
}
