import type { Element, ElementSize, ElementSizeController, ViewRectVertexes, PointSize, ViewScaleInfo, LayoutSizeController } from '@idraw/types';
import { createUUID } from './uuid';
import { getCenterFromTwoPoints } from './point';
import { calcElementVertexesInGroup, calcElementVertexes } from './vertex';
import { calcViewElementSize } from './view-calc';
import { calcElementCenter } from './rotate';

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
  const rotateElemVertexes = calcElementVertexesInGroup(
    {
      x: x - ctrlSize * 2,
      y: y - ctrlSize * 2,
      h: h + ctrlSize * 4,
      w: w + ctrlSize * 4,
      angle
    },
    { groupQueue: [...groupQueue] }
  ) as ViewRectVertexes;

  const topCenter = getCenterFromTwoPoints(vertexes[0], vertexes[1]);
  const rightCenter = getCenterFromTwoPoints(vertexes[1], vertexes[2]);
  const bottomCenter = getCenterFromTwoPoints(vertexes[2], vertexes[3]);
  const leftCenter = getCenterFromTwoPoints(vertexes[3], vertexes[0]);

  const topLeftCenter = vertexes[0];
  const topRightCenter = vertexes[1];
  const bottomRightCenter = vertexes[2];
  const bottomLeftCenter = vertexes[3];

  const topMiddleSize = createControllerElementSizeFromCenter(topCenter, { size: ctrlSize, angle: totalAngle });
  const rightMiddleSize = createControllerElementSizeFromCenter(rightCenter, { size: ctrlSize, angle: totalAngle });
  const bottomMiddleSize = createControllerElementSizeFromCenter(bottomCenter, { size: ctrlSize, angle: totalAngle });
  const leftMiddleSize = createControllerElementSizeFromCenter(leftCenter, { size: ctrlSize, angle: totalAngle });

  const topLeftSize = createControllerElementSizeFromCenter(topLeftCenter, { size: ctrlSize, angle: totalAngle });
  const topRightSize = createControllerElementSizeFromCenter(topRightCenter, { size: ctrlSize, angle: totalAngle });
  const bottomLeftSize = createControllerElementSizeFromCenter(bottomLeftCenter, { size: ctrlSize, angle: totalAngle });
  const bottomRightSize = createControllerElementSizeFromCenter(bottomRightCenter, { size: ctrlSize, angle: totalAngle });

  const topLeftVertexes = calcElementVertexes(topLeftSize);
  const topRightVertexes = calcElementVertexes(topRightSize);
  const bottomLeftVertexes = calcElementVertexes(bottomLeftSize);
  const bottomRightVertexes = calcElementVertexes(bottomRightSize);

  const topVertexes: ViewRectVertexes = [topLeftVertexes[1], topRightVertexes[0], topRightVertexes[3], topLeftVertexes[2]];
  const rightVertexes: ViewRectVertexes = [topRightVertexes[3], topRightVertexes[2], bottomRightVertexes[1], bottomRightVertexes[0]];
  const bottomVertexes: ViewRectVertexes = [bottomLeftVertexes[1], bottomRightVertexes[0], bottomRightVertexes[3], bottomLeftVertexes[2]];
  const leftVertexes: ViewRectVertexes = [topLeftVertexes[3], topLeftVertexes[2], bottomLeftVertexes[1], bottomLeftVertexes[0]];

  const topMiddleVertexes = calcElementVertexes(topMiddleSize);
  const rightMiddleVertexes = calcElementVertexes(rightMiddleSize);
  const bottomMiddleVertexes = calcElementVertexes(bottomMiddleSize);
  const leftMiddleVertexes = calcElementVertexes(leftMiddleSize);

  // const originRotateCenter: PointSize = {
  //   x: x + w / 2,
  //   y: y - ctrlSize * 4
  // };

  // const rotateCenter = topCenter;
  const rotateCenter = getCenterFromTwoPoints(rotateElemVertexes[0], rotateElemVertexes[1]);
  const rotateSize = createControllerElementSizeFromCenter(rotateCenter, { size: ctrlSize, angle: totalAngle });
  const rotateVertexes = calcElementVertexes(rotateSize);

  // const rotateCtrlElem: ElementSize = {
  //   x: originRotateCenter.x - ctrlSize / 2,
  //   y: originRotateCenter.x - ctrlSize / 2,
  //   w: ctrlSize,
  //   h: ctrlSize,
  //   angle
  // };
  // const rotateVertexes = calcElementVertexesInGroup(rotateCtrlElem, { groupQueue }) as ViewRectVertexes;
  // const rotateCenter = getCenterFromTwoPoints(rotateVertexes[0], rotateVertexes[2]);

  const sizeController: ElementSizeController = {
    elementWrapper: vertexes,
    left: {
      type: 'left',
      vertexes: leftVertexes,
      center: leftCenter
    },
    right: {
      type: 'right',
      vertexes: rightVertexes,
      center: rightCenter
    },
    top: {
      type: 'top',
      vertexes: topVertexes,
      center: topCenter
    },
    bottom: {
      type: 'bottom',
      vertexes: bottomVertexes,
      center: bottomCenter
    },
    topLeft: {
      type: 'top-left',
      vertexes: topLeftVertexes,
      center: topLeftCenter
    },
    topRight: {
      type: 'top-right',
      vertexes: topRightVertexes,
      center: topRightCenter
    },
    bottomLeft: {
      type: 'bottom-left',
      vertexes: bottomLeftVertexes,
      center: bottomLeftCenter
    },
    bottomRight: {
      type: 'bottom-right',
      vertexes: bottomRightVertexes,
      center: bottomRightCenter
    },
    leftMiddle: {
      type: 'left-middle',
      vertexes: leftMiddleVertexes,
      center: leftCenter
    },
    rightMiddle: {
      type: 'right-middle',
      vertexes: rightMiddleVertexes,
      center: rightCenter
    },
    topMiddle: {
      type: 'top-middle',
      vertexes: topMiddleVertexes,
      center: topCenter
    },
    bottomMiddle: {
      type: 'bottom-middle',
      vertexes: bottomMiddleVertexes,
      center: bottomCenter
    },
    rotate: {
      type: 'rotate',
      vertexes: rotateVertexes,
      center: rotateCenter
    }
  };
  return sizeController;
}

export function calcLayoutSizeController(
  layoutSize: Pick<ElementSize, 'x' | 'y' | 'w' | 'h'>,
  opts: {
    controllerSize?: number;
    viewScaleInfo: ViewScaleInfo;
  }
): LayoutSizeController {
  const { controllerSize, viewScaleInfo } = opts;

  const ctrlSize = controllerSize && controllerSize > 0 ? controllerSize : 8;

  const { x, y, w, h } = calcViewElementSize(layoutSize, { viewScaleInfo });
  const center = calcElementCenter({ x, y, w, h });

  const topCenter = { x: center.x, y };
  const rightCenter = { x: x + w, y: center.y };
  const bottomCenter = { x: center.x, y: y + h };
  const leftCenter = { x, y: center.y };

  const topLeftCenter = { x, y };
  const topRightCenter = { x: x + w, y };
  const bottomRightCenter = { x: x + w, y: y + h };
  const bottomLeftCenter = { x, y: y + h };

  const topMiddleSize = createControllerElementSizeFromCenter(topCenter, { size: ctrlSize, angle: 0 });
  const rightMiddleSize = createControllerElementSizeFromCenter(rightCenter, { size: ctrlSize, angle: 0 });
  const bottomMiddleSize = createControllerElementSizeFromCenter(bottomCenter, { size: ctrlSize, angle: 0 });
  const leftMiddleSize = createControllerElementSizeFromCenter(leftCenter, { size: ctrlSize, angle: 0 });

  const topLeftSize = createControllerElementSizeFromCenter(topLeftCenter, { size: ctrlSize, angle: 0 });
  const topRightSize = createControllerElementSizeFromCenter(topRightCenter, { size: ctrlSize, angle: 0 });
  const bottomLeftSize = createControllerElementSizeFromCenter(bottomLeftCenter, { size: ctrlSize, angle: 0 });
  const bottomRightSize = createControllerElementSizeFromCenter(bottomRightCenter, { size: ctrlSize, angle: 0 });

  const topLeftVertexes = calcElementVertexes(topLeftSize);
  const topRightVertexes = calcElementVertexes(topRightSize);
  const bottomLeftVertexes = calcElementVertexes(bottomLeftSize);
  const bottomRightVertexes = calcElementVertexes(bottomRightSize);

  const topVertexes: ViewRectVertexes = [topLeftVertexes[1], topRightVertexes[0], topRightVertexes[3], topLeftVertexes[2]];
  const rightVertexes: ViewRectVertexes = [topRightVertexes[3], topRightVertexes[2], bottomRightVertexes[1], bottomRightVertexes[0]];
  const bottomVertexes: ViewRectVertexes = [bottomLeftVertexes[1], bottomRightVertexes[0], bottomRightVertexes[3], bottomLeftVertexes[2]];
  const leftVertexes: ViewRectVertexes = [topLeftVertexes[3], topLeftVertexes[2], bottomLeftVertexes[1], bottomLeftVertexes[0]];

  const topMiddleVertexes = calcElementVertexes(topMiddleSize);
  const rightMiddleVertexes = calcElementVertexes(rightMiddleSize);
  const bottomMiddleVertexes = calcElementVertexes(bottomMiddleSize);
  const leftMiddleVertexes = calcElementVertexes(leftMiddleSize);

  const sizeController: LayoutSizeController = {
    left: {
      type: 'left',
      vertexes: leftVertexes,
      center: leftCenter
    },
    right: {
      type: 'right',
      vertexes: rightVertexes,
      center: rightCenter
    },
    top: {
      type: 'top',
      vertexes: topVertexes,
      center: topCenter
    },
    bottom: {
      type: 'bottom',
      vertexes: bottomVertexes,
      center: bottomCenter
    },
    topLeft: {
      type: 'top-left',
      vertexes: topLeftVertexes,
      center: topLeftCenter
    },
    topRight: {
      type: 'top-right',
      vertexes: topRightVertexes,
      center: topRightCenter
    },
    bottomLeft: {
      type: 'bottom-left',
      vertexes: bottomLeftVertexes,
      center: bottomLeftCenter
    },
    bottomRight: {
      type: 'bottom-right',
      vertexes: bottomRightVertexes,
      center: bottomRightCenter
    },
    leftMiddle: {
      type: 'left-middle',
      vertexes: leftMiddleVertexes,
      center: leftCenter
    },
    rightMiddle: {
      type: 'right-middle',
      vertexes: rightMiddleVertexes,
      center: rightCenter
    },
    topMiddle: {
      type: 'top-middle',
      vertexes: topMiddleVertexes,
      center: topCenter
    },
    bottomMiddle: {
      type: 'bottom-middle',
      vertexes: bottomMiddleVertexes,
      center: bottomCenter
    }
  };
  return sizeController;
}
