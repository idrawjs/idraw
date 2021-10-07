import { parseHTMLToDataURL, parseSVGToDataURL } from './parser';
const { Image } = window;

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image;
    img.onload = function() {
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


export async function loadHTML(html: string, opts: { width: number, height: number }): Promise<HTMLImageElement> {
  const dataURL = await parseHTMLToDataURL(html, opts);
  const image = await loadImage(dataURL);
  return image;
}


