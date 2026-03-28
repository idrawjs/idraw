import { HTMLCSSProps, HTMLProps } from '@idraw/types';
import { istype } from '../tool/istype';

type DOMElement = HTMLElement | SVGElement | Element;

const aliasKeys: Record<string, string> = {
  className: 'class',
};

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

const parseCSSValue = (key: string, value: string) => {
  const str = typeof value === 'number' && defaultPixelKeys.includes(key) ? `${value}px` : value;
  return str;
};

export function addClassName<T extends DOMElement = DOMElement>(elem: T, classNameList: string[]) {
  classNameList.forEach((className: string | undefined) => {
    if (!className) {
      return;
    }
    const name = className.trim();
    const strs = name.split(' ');
    strs.forEach((str) => {
      if (str && !elem.classList.contains(str)) {
        elem.classList.add(str);
      }
    });
  });
}

export function removeClassName<T extends HTMLElement = HTMLElement>(elem: T, classNameList: string[]) {
  classNameList.forEach((className: string | undefined) => {
    if (!className) {
      return;
    }
    if (elem.classList.contains(className)) {
      elem.classList.remove(className);
    }
  });
}

export function setHTMLCSSProps(elem: HTMLElement, cssProps: HTMLCSSProps): HTMLElement {
  Object.keys(cssProps).forEach((key) => {
    const value = cssProps[key as keyof HTMLCSSProps];
    elem.style[key as any] = parseCSSValue(key, value as string);
  });
  return elem;
}

function appendPropsToHTMLElement(elem: DOMElement, props: HTMLProps): DOMElement {
  Object.entries(props).forEach(([attrKey, attrValue]) => {
    const key = aliasKeys[attrKey] ? aliasKeys[attrKey] : attrKey;
    const attributeName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    const value = attrValue;

    if (key === 'style') {
      if (istype.json(attrValue)) {
        setHTMLCSSProps(elem as HTMLElement, attrValue);
      } else if (typeof attrValue === 'string') {
        elem.setAttribute(attributeName, attrValue);
      }
    } else if (key === 'class' && typeof attrValue === 'string') {
      addClassName(elem, attrValue.split(' '));
    } else {
      let v = value;
      if (v === undefined || v === null) {
        v = '';
      }
      elem.setAttribute(attributeName, String(v));
    }
  });
  return elem;
}

export function assembleHTMLElement<T extends DOMElement = HTMLElement>(
  root: T,
  props?: HTMLProps,
  children?: string | HTMLElement | SVGElement | Element | Array<HTMLElement | SVGElement | Element | string>
): T {
  const { children: propsChildren, ...restProps } = props || {};
  const widgetChildren = children || propsChildren;
  appendPropsToHTMLElement(root, restProps || {});
  if (Array.isArray(widgetChildren)) {
    widgetChildren?.forEach((child) => {
      if (child instanceof Element || typeof child === 'string') {
        root.append(child);
      }
    });
  } else if (widgetChildren instanceof Element || typeof widgetChildren === 'string') {
    root.append(widgetChildren);
  }

  return root;
}

export function createHTMLElement<K extends keyof HTMLElementTagNameMap = 'div'>(
  tagName: K,
  props?: HTMLProps,
  children?: Array<Element | HTMLElement>
): HTMLElementTagNameMap[K] {
  const elem = document.createElement(tagName);
  return assembleHTMLElement(elem, props, children);
}

export function sanitizeHTMLStr(htmlString: string): string {
  const dangerousTagsRegex = /<(script|iframe|object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi;

  return htmlString.replace(dangerousTagsRegex, '');
}

export function parseHTMLStr(htmlString: string): HTMLElement {
  const sanitizedString = sanitizeHTMLStr(htmlString);

  const template = document.createElement('template');
  template.innerHTML = sanitizedString.trim();

  const element = template.content.firstElementChild;
  return element as HTMLElement;
}

export function getHTMLElementRectInPage(elem: HTMLElement) {
  const rect = elem.getBoundingClientRect();
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;

  return {
    pageX: rect.left + scrollX,
    pageY: rect.top + scrollY,
    width: rect.width,
    height: rect.height,
  };
}

export const bubbleHTMLElement = (
  $active: HTMLElement,
  $root: HTMLElement,
  targetProps: { [key: string]: string | true }
) => {
  let $current: HTMLElement | null = $active;
  const propsKeys = Object.keys(targetProps);
  const isTarget = () => {
    if (!$current) {
      return false;
    }
    for (let i = 0; i < propsKeys.length; i++) {
      const key = propsKeys[i];
      const value = targetProps[key];
      if (typeof key === 'string' && key && typeof value === 'string' && value) {
        if (key === 'className' && $current?.classList.contains(value)) {
          continue;
        }
        if ($current.getAttribute(key) === value) {
          continue;
        }
        return false;
      } else if (typeof key === 'string' && key && typeof value === 'boolean') {
        if ($current.hasAttribute(key) && value === true) {
          continue;
        }
        return false;
      }
    }
    return true;
  };

  while ($current) {
    if (isTarget()) {
      return $current;
    }
    if ($root === $current) {
      return null;
    }
    if (!$root.contains($current)) {
      return null;
    }
    $current = $current.parentElement;
  }
  return null;
};

export function isPointInMiddlewareElement(
  e: Event,
  opts: {
    $root: HTMLElement | null;
    rootClassName: string;
  }
): boolean {
  const { $root, rootClassName } = opts;
  if (!$root) {
    return false;
  }
  const $target = e.target as HTMLElement;

  const $elem = bubbleHTMLElement($target, $root, { className: rootClassName });
  if ($elem) {
    return true;
  }
  return false;
}
