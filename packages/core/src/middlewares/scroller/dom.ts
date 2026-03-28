import { ATTR_VALID_WATCH, createHTMLElement, setHTMLCSSProps } from '@idraw/util';
import { classNameMap, ATTR_THUMB_TYPE, THUMB_X, THUMB_Y } from './static';
import type { ScrollbarStyles } from './types';

export function initRoot(opts: { rootClassName: string; $container: HTMLElement }) {
  const { rootClassName, $container } = opts;
  const create = createHTMLElement;

  const $horizontal = create(
    'div',
    {
      className: `${rootClassName} ${classNameMap.horizontal}`,
      [ATTR_VALID_WATCH]: 'true',
    },
    [create('div', { className: classNameMap.thumb, [ATTR_VALID_WATCH]: 'true', [ATTR_THUMB_TYPE]: THUMB_X })]
  );
  const $vertical = create(
    'div',
    {
      className: `${rootClassName} ${classNameMap.vertical}`,
      [ATTR_VALID_WATCH]: 'true',
    },
    [create('div', { className: classNameMap.thumb, [ATTR_VALID_WATCH]: 'true', [ATTR_THUMB_TYPE]: THUMB_Y })]
  );
  $container.appendChild($horizontal);
  $container.appendChild($vertical);

  return {
    $horizontal,
    $vertical,
  };
}

export function isInScrollbar(e: Event) {
  const $target = e.target as HTMLElement;
  if (
    $target?.classList?.contains(classNameMap.thumb) ||
    $target?.classList?.contains(classNameMap.horizontal) ||
    $target?.classList?.contains(classNameMap.vertical)
  ) {
    return true;
  }
  return false;
}

export function updateScrollbarStyles(
  opts: ScrollbarStyles & {
    $horizontal: HTMLElement | null;
    $vertical: HTMLElement | null;
  }
) {
  const { xThumbStyle, yThumbStyle, $horizontal, $vertical } = opts;
  if ($horizontal && xThumbStyle) {
    const $thumb = $horizontal.getElementsByClassName(classNameMap.thumb)[0] as HTMLElement;
    if ($thumb) {
      setHTMLCSSProps($thumb, xThumbStyle);
    }
  }
  if ($vertical && yThumbStyle) {
    const $thumb = $vertical.getElementsByClassName(classNameMap.thumb)[0] as HTMLElement;
    if ($thumb) {
      setHTMLCSSProps($thumb, yThumbStyle);
    }
  }
}

export function getThumbType(e: Event) {
  const $target = e?.target as HTMLElement;
  if ($target?.classList?.contains(classNameMap.thumb) && $target.hasAttribute(ATTR_THUMB_TYPE)) {
    return $target.getAttribute(ATTR_THUMB_TYPE) as null | 'X' | 'Y';
  }
  return null;
}
