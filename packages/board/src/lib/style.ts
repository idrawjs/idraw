import istype from './istype';

export const mergeCSS2StyleAttr = function(
  cssMap: {[key: string]: string} = {}
): string {
  const cssList = [];
  if (istype.json(cssMap) === true) {
    for (const key in cssMap) {
      let cssKey = `${key}`;
      let cssVal = `${cssMap[key]}`;
      cssKey = cssKey.trim();
      cssVal = cssVal.trim();
      cssList.push(`${cssKey}:${cssVal}`);
    }
  }
  const styleAttr = cssList.join('; ') + ';';
  return styleAttr;
};


export function setStyle(
  dom: HTMLElement, 
  style: {[key: string]: string}
): void {
  const originStyle = getStyle(dom);
  const _style = {...originStyle, ...style};
  const keys: string[] = Object.keys(_style);
  let styleStr = '';
  keys.forEach((key: string) => {
    styleStr += `${key}:${_style[key] || ''};`;
  });
  dom.setAttribute('style', styleStr);
}

export function getStyle(dom: HTMLElement): {[key: string]: string} {
  const styleObj: {[key: string]: string} = {};
  const style = dom.getAttribute('style') || '';
  const styleList = style.split(';');
  styleList.forEach((item: string) => {
    const dataList = item.split(':');
    if (dataList[0] && typeof dataList[0] === 'string') {
      styleObj[dataList[0]] = dataList[1] || '';
    }
  });

  return styleObj;
}

export function getDomTransform(dom: HTMLElement): {
  scaleX: number;
  skewY: number;
  skewX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
} {
  // transform: matrix( scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY() )
  // matrix(1, 0, 0, 1, 0, 0)
  const style = getComputedStyle(dom) || {};
  const { transform } = style;
  const matrixStr = transform.replace(/^matrix\(|\)$/ig, '');
  const matrixList = matrixStr.split(',').map((str, i) => {
    const val = parseFloat(str);
    if ([0, 3].indexOf(i) >= 0) {
      return isNaN(val) ? 1 : val;
    } else {
      return isNaN(val) ? 0 : val;
    }
  });
  const matrix = {
    scaleX: matrixList[0],
    skewY: matrixList[1] || 0,
    skewX: matrixList[2] || 0,
    scaleY: matrixList[3] || 1,
    translateX: matrixList[4] || 0,
    translateY: matrixList[5] || 0,
  };
  return matrix;
}


export function setDomTransform(dom: HTMLElement, matrix: {
  scaleX: number;
  skewY: number;
  skewX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
}): void {
  // transform: matrix( scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY() )
  // matrix(1, 2, -1, 1, 80, 80)

  const transform = `matrix(${matrix.scaleX}, ${matrix.skewY}, ${matrix.skewX}, ${matrix.scaleY}, ${matrix.translateX}, ${matrix.translateY})`;
  dom.style.setProperty('transform', transform);
}
