export function parseHTMLToDataURL(html: string, opts: { width: number; height: number }): Promise<string> {
  const { width, height } = opts;
  return new Promise((resolve, reject) => {
    const _svg = `
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="${width || ''}" 
      height = "${height || ''}">
      <foreignObject width="100%" height="100%">
        <div xmlns = "http://www.w3.org/1999/xhtml">
          ${html}
        </div>
      </foreignObject>
    </svg>
    `;
    const blob = new Blob([_svg], { type: 'image/svg+xml;charset=utf-8' });
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function (event: ProgressEvent<FileReader>) {
      const base64: string = event?.target?.result as string;
      resolve(base64);
    };
    reader.onerror = function (err) {
      reject(err);
    };
  });
}

export function parseSVGToDataURL(svg: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const _svg = svg;
    const blob = new Blob([_svg], { type: 'image/svg+xml;charset=utf-8' });
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function (event: ProgressEvent<FileReader>) {
      const base64: string = event?.target?.result as string;
      resolve(base64);
    };
    reader.onerror = function (err) {
      reject(err);
    };
  });
}
