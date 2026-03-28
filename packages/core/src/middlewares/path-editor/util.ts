import type { StrictMaterial, Point, PathAnchorCommand, ViewCalculator, VirtualPathAttributes } from '@idraw/types';

export function calcPointInCanvas(e: MouseEvent, container: HTMLElement): Point {
  const { pageX, pageY } = e;

  const rect = container.getBoundingClientRect();
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  const containerPageX = rect.left + scrollLeft;
  const containerPageY = rect.top + scrollTop;

  const containerX = pageX - containerPageX;
  const containerY = pageY - containerPageY;

  return {
    x: containerX,
    y: containerY,
  };
}

export function getPathAnchorCommands(
  material: StrictMaterial<'path'> | null,
  opts: {
    calculator: ViewCalculator;
  }
): PathAnchorCommand[] {
  const { calculator } = opts;

  const { id } = material as StrictMaterial<'path'>;
  const flatItem: VirtualPathAttributes = calculator.getVirtualItem(id) as VirtualPathAttributes;
  const cmds = [...(flatItem.anchorCommands || [])];
  return cmds;
}
