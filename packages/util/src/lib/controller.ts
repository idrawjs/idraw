import { createUUID } from './uuid';
import { calcElementVertexesInGroup } from './vertex';
import type { Element, ElementSize, ElementSizeController, ViewRectVertexes } from '@idraw/types';

export function calcElementSizeController(
  elemSize: ElementSize,
  opts: {
    groupQueue: Element<'group'>[];
    controllerSize?: number;
  }
): ElementSizeController {
  const { groupQueue, controllerSize } = opts;

  const bw = 0; // TODO
  const ctrlSize = controllerSize && controllerSize > 0 ? controllerSize : 8;
  const { x, y, w, h, angle = 0 } = elemSize;
  const topSize: ElementSize = {
    x: 0 - bw + w / 2 - ctrlSize / 2,
    y: 0 - bw - ctrlSize / 2,
    w: ctrlSize,
    h: ctrlSize
  };
  const rightSize: ElementSize = {
    x: 0 + w - bw - ctrlSize / 2,
    y: 0 + h / 2 - bw - ctrlSize / 2,
    w: ctrlSize,
    h: ctrlSize
  };
  const bottomSize: ElementSize = {
    x: 0 + w / 2 - bw - ctrlSize / 2,
    y: 0 + h - bw - ctrlSize / 2,
    w: ctrlSize,
    h: ctrlSize
  };
  const leftSize: ElementSize = {
    x: 0 - bw - ctrlSize / 2,
    y: 0 + h / 2 - bw - ctrlSize / 2,
    w: ctrlSize,
    h: ctrlSize
  };

  const ctrlGroupQueue = [
    ...[
      {
        uuid: createUUID(),
        x,
        y,
        w,
        h,
        angle,
        type: 'group',
        detail: { children: [] }
      } as Element<'group'>
    ],
    ...groupQueue
  ];

  // const ctrlGroupQueue = [...groupQueue] as Element<'group'>[];

  const sizeController: ElementSizeController = {
    elementWrapper: calcElementVertexesInGroup(elemSize, { groupQueue }) as ViewRectVertexes,
    left: {
      type: 'left',
      vertexes: calcElementVertexesInGroup(leftSize, { groupQueue: ctrlGroupQueue }) as ViewRectVertexes
    },
    right: {
      type: 'right',
      vertexes: calcElementVertexesInGroup(rightSize, { groupQueue: ctrlGroupQueue }) as ViewRectVertexes
    },
    top: {
      type: 'top',
      vertexes: calcElementVertexesInGroup(topSize, { groupQueue: ctrlGroupQueue }) as ViewRectVertexes
    },
    bottom: {
      type: 'bottom',
      vertexes: calcElementVertexesInGroup(bottomSize, { groupQueue: ctrlGroupQueue }) as ViewRectVertexes
    }
  };
  return sizeController;
}
