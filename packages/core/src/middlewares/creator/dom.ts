import { ATTR_VALID_WATCH, createHTMLElement, assembleHTMLElement, setHTMLCSSProps } from '@idraw/util';
import type { Point } from '@idraw/types';
import { classNameMap } from './static';

function destroyBoxs($root: HTMLDivElement | null, opts: { className: string }) {
  if (!$root) {
    return;
  }
  const { className } = opts;
  // clear existed hover box
  const $prevBoxs = Array.from($root.getElementsByClassName(className));
  $prevBoxs.forEach(($box) => {
    $box.remove();
  });
}

export function initRoot(opts: { rootClassName: string; $container: HTMLElement }) {
  const { rootClassName, $container } = opts;
  const create = createHTMLElement;

  const $root = create(
    'div',
    {
      className: rootClassName,
      [ATTR_VALID_WATCH]: 'true',
    },
    [
      // create('div', { className: classNameMap.creationAreaBox, [ATTR_VALID_WATCH]: 'true' })
    ]
  );

  $container.appendChild($root);

  return $root;
}

export function getCreationAreaBox($root: HTMLDivElement) {
  const $boxs = $root.getElementsByClassName(classNameMap.creationAreaBox);
  if ($boxs[0]) {
    return $boxs[0] as HTMLElement;
  }
  const $box = createHTMLElement('div', { [ATTR_VALID_WATCH]: 'true', className: classNameMap.creationAreaBox });
  assembleHTMLElement($root, {}, [$box]);
  return $box as HTMLElement;
}

export function clearCreationAreaBox($root: HTMLDivElement | null) {
  destroyBoxs($root, { className: classNameMap.creationAreaBox });
}

export function resetCreationAreaBox(
  $root: HTMLDivElement | null,
  opts: {
    start: Point;
    end: Point;
  }
) {
  if (!$root) {
    return;
  }

  const { start, end } = opts;

  if (start && end) {
    const $box = getCreationAreaBox($root);

    // start = calcViewPoint(start, { viewScaleInfo });
    // end = calcViewPoint(end, { viewScaleInfo });

    setHTMLCSSProps($box, {
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    });
  } else {
    clearCreationAreaBox($root);
  }
}
