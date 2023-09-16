import { createUUID } from './uuid';
import { getCenterFromTwoPoints } from './point';
import { calcElementVertexesInGroup, calcElementVertexes } from './vertex';
import type { Element, ElementSize, ElementSizeController, ViewRectVertexes, PointSize, ViewScaleInfo } from '@idraw/types';

function createControllerElementSizeFromCenter(center: PointSize, opts: { size: number; angle: number }) {
  const { x, y } = center;
  const { size, angle } = opts;
  return {
    x: x - size / 2,
    y: y - size / 2,
    w: size,
    h: size,
    angle
  };
}

export function calcElementSizeController(
  elemSize: ElementSize,
  opts: {
    groupQueue: Element<'group'>[];
    controllerSize?: number;
    viewScaleInfo: ViewScaleInfo;
  }
): ElementSizeController {
  const { groupQueue, controllerSize, viewScaleInfo } = opts;

  const ctrlSize = (controllerSize && controllerSize > 0 ? controllerSize : 8) / viewScaleInfo.scale;
  const { x, y, w, h, angle = 0 } = elemSize;
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
  let totalAngle = 0;
  ctrlGroupQueue.forEach(({ angle = 0 }) => {
    totalAngle += angle;
  });

  const vertexes = calcElementVertexesInGroup(elemSize, { groupQueue }) as ViewRectVertexes;
  const topCenter = getCenterFromTwoPoints(vertexes[0], vertexes[1]);
  const rightCenter = getCenterFromTwoPoints(vertexes[1], vertexes[2]);
  const bottomCenter = getCenterFromTwoPoints(vertexes[2], vertexes[3]);
  const leftCenter = getCenterFromTwoPoints(vertexes[3], vertexes[0]);

  const topLeftCenter = vertexes[0];
  const topRightCenter = vertexes[1];
  const bottomRightCenter = vertexes[2];
  const bottomLeftCenter = vertexes[3];

  const topSize = createControllerElementSizeFromCenter(topCenter, { size: ctrlSize, angle: totalAngle });
  const rightSize = createControllerElementSizeFromCenter(rightCenter, { size: ctrlSize, angle: totalAngle });
  const bottomSize = createControllerElementSizeFromCenter(bottomCenter, { size: ctrlSize, angle: totalAngle });
  const leftSize = createControllerElementSizeFromCenter(leftCenter, { size: ctrlSize, angle: totalAngle });
  const topLeftSize = createControllerElementSizeFromCenter(topLeftCenter, { size: ctrlSize, angle: totalAngle });
  const topRightSize = createControllerElementSizeFromCenter(topRightCenter, { size: ctrlSize, angle: totalAngle });
  const bottomLeftSize = createControllerElementSizeFromCenter(bottomLeftCenter, { size: ctrlSize, angle: totalAngle });
  const bottomRightSize = createControllerElementSizeFromCenter(bottomRightCenter, { size: ctrlSize, angle: totalAngle });

  const sizeController: ElementSizeController = {
    elementWrapper: vertexes,
    left: {
      type: 'left',
      vertexes: calcElementVertexes(leftSize)
    },
    right: {
      type: 'right',
      vertexes: calcElementVertexes(rightSize)
    },
    top: {
      type: 'top',
      vertexes: calcElementVertexes(topSize)
    },
    bottom: {
      type: 'bottom',
      vertexes: calcElementVertexes(bottomSize)
    },
    topLeft: {
      type: 'top-left',
      vertexes: calcElementVertexes(topLeftSize)
    },
    topRight: {
      type: 'top-right',
      vertexes: calcElementVertexes(topRightSize)
    },
    bottomLeft: {
      type: 'bottom-left',
      vertexes: calcElementVertexes(bottomLeftSize)
    },
    bottomRight: {
      type: 'bottom-right',
      vertexes: calcElementVertexes(bottomRightSize)
    }
  };
  return sizeController;
}
