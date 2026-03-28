import type { StylesProps } from '@idraw/types';

const defaultPixelKeys = [
  'width',
  'height',
  'left',
  'right',
  'top',
  'bottom',
  'margin',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'padding',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
];

const parseCSSNumValue = (key: string, value: number) => {
  const str = defaultPixelKeys.includes(key) ? `${value}px` : value;
  return str;
};

/** Convert camelCase property to kebab-case */
function toKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}

/** Convert JSON style object into CSS string */
export function parseStyles(styles: StylesProps, selector: string): string {
  const baseStyles: string[] = [];
  const nestedStyles: string[] = [];

  for (const key in styles) {
    let value = styles[key];
    if (typeof value === 'number') {
      value = parseCSSNumValue(key, value);
    }
    // Media queries or keyframes
    if (key.startsWith('@')) {
      nestedStyles.push(`${key} { ${parseStyles(value as StylesProps, selector)} }`);
    }
    // Pseudo-classes or nested selectors
    else if (key.startsWith('&') || key.startsWith('.') || key.startsWith('#')) {
      const nestedSelector = key.startsWith('&') ? key.replace('&', selector) : `${selector} ${key}`;
      nestedStyles.push(parseStyles(value as StylesProps, nestedSelector));
    }
    // Regular CSS properties
    else {
      baseStyles.push(`${toKebabCase(key)}: ${value};`);
    }
  }

  const cssString = baseStyles.length ? `${selector} { ${baseStyles.join(' ')} }` : '';

  return [cssString, ...nestedStyles].filter(Boolean).join('\n');
}

const ATTR_STYLE_KEY = 'data-idraw-style-id';

const styleSheetMap: Record<string, CSSStyleSheet> = {};

export function injectStyles(opts: { styles: StylesProps; rootClassName: string; type?: 'default' | 'element' }) {
  const { styles, rootClassName, type } = opts;
  const cssString = parseStyles(styles, `.${rootClassName}`);

  if (type === 'element') {
    const style = document.createElement('style');
    style.setAttribute(ATTR_STYLE_KEY, rootClassName);
    style.textContent = cssString;
    const container = document.head || document.body;
    container.appendChild(style);
  } else {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssString);
    styleSheetMap[rootClassName] = sheet;
    // Mount the stylesheet into the document
    (document as any).adoptedStyleSheets = [...(document as any).adoptedStyleSheets, sheet];
  }
}

export function removeStyles(opts: { rootClassName: string; type: 'default' | 'element' }) {
  const { rootClassName, type } = opts;
  if (type === 'element') {
    const style = document.querySelector(`[${ATTR_STYLE_KEY}="${rootClassName}"]`);
    style?.remove();
  } else if (styleSheetMap[rootClassName]) {
    const sheet = styleSheetMap[rootClassName];
    const newSheets = document.adoptedStyleSheets.filter((s) => s !== sheet);
    document.adoptedStyleSheets = newSheets;
  }
}
