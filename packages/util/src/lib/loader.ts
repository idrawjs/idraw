const { Image, Blob, FileReader } = window;

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


export function loadSVG(svg: string, opts?: { width: number, height: number }): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // let style = '';
    // if (opts) {
    //   style = `min-height: ${opts.height}px; min-width: ${opts.width}px`
    // }
    // const _svg = `
    //   <svg xmlns="http://www.w3.org/2000/svg"
    //     width="${opts?.width || ''}"
    //     height="${opts?.height || ''}"
    //     style="${style}" >
    //     <foreignObject width="100%" height="100%">
    //       ${svg}
    //     </foreignObject>
    //   </svg>
    //   `;

    const _svg = svg;

    const image = new Image();
    const blob = new Blob([_svg], { type: 'image/svg+xml;charset=utf-8'});
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function (event: ProgressEvent<FileReader>) {
      const base64: string = event?.target?.result as string;
      image.onload = function() {
        resolve(image);
      };
      image.src = base64;
    };
    reader.onerror = function(err) {
      reject(err);
    };
  });
}