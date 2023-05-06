import { parseHTMLToDataURL, parseSVGToDataURL } from './parser';
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

export async function loadSVG(svg: string): Promise<HTMLImageElement> {
  const dataURL = await parseSVGToDataURL(svg);
  const image = await loadImage(dataURL);
  return image;
}

function filterAmpersand(str: string): string {
  return str.replace(/\&/gi, '&amp;');
}

export async function loadHTML(html: string, opts: { width: number; height: number }): Promise<HTMLImageElement> {
  html = filterAmpersand(html);
  const dataURL = await parseHTMLToDataURL(html, opts);
  const image = await loadImage(dataURL);
  return image;
}
