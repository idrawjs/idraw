import type {
  StrictMaterial,
  MaterialSize,
  MaterialSizeController,
  ViewRectVertexes,
  Point,
  ViewScaleInfo,
  LayoutSizeController,
} from '@idraw/types';
import { createUUID } from '../tool/uuid';
import { getCenterFromTwoPoints } from './point';
import { calcMaterialVertexesInGroup, calcMaterialVertexes } from './vertex';
import { calcViewMaterialSize } from './view-calc';
import { calcMaterialCenter } from './rotate';

function createControllerMaterialSizeFromCenter(center: Point, opts: { size: number; angle: number }) {
  const { x, y } = center;
  const { size, angle } = opts;
  return {
    x: x - size / 2,
    y: y - size / 2,
    width: size,
    height: size,
    angle,
  };
}

export function calcMaterialSizeController(
  mtrlSize: MaterialSize,
  opts: {
    groupQueue: StrictMaterial<'group'>[];
    controllerSize: number;
    rotateControllerSize: number;
    rotateControllerPosition: number;
    viewScaleInfo: ViewScaleInfo;
  }
): MaterialSizeController {
  const { groupQueue, controllerSize, viewScaleInfo, rotateControllerSize, rotateControllerPosition } = opts;

  const ctrlSize = (controllerSize && controllerSize > 0 ? controllerSize : 8) / viewScaleInfo.scale;
  const { x, y, width, height, angle = 0 } = mtrlSize;

  const rotateCtrlSize = rotateControllerSize;
  const rotateCtrlPos = rotateControllerPosition;

  const ctrlGroupQueue = [
    ...[
      {
        id: createUUID(),
        x,
        y,
        width,
        height,
        angle,
        type: 'group',
        children: [],
      } as StrictMaterial<'group'>,
    ],
    ...groupQueue,
  ];
  let totalAngle = 0;
  ctrlGroupQueue.forEach(({ angle = 0 }) => {
    totalAngle += angle;
  });

  const vertexes = calcMaterialVertexesInGroup(mtrlSize, { groupQueue }) as ViewRectVertexes;
  const rotateMaterialVertexes = calcMaterialVertexesInGroup(
    {
      x: x,
      y: y - (rotateCtrlPos + rotateCtrlSize / 2) / viewScaleInfo.scale,
      height: height + (rotateCtrlPos * 2 + rotateCtrlSize) / viewScaleInfo.scale,
      width,
      angle,
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

  const topMiddleSize = createControllerMaterialSizeFromCenter(topCenter, { size: ctrlSize, angle: totalAngle });
  const rightMiddleSize = createControllerMaterialSizeFromCenter(rightCenter, { size: ctrlSize, angle: totalAngle });
  const bottomMiddleSize = createControllerMaterialSizeFromCenter(bottomCenter, { size: ctrlSize, angle: totalAngle });
  const leftMiddleSize = createControllerMaterialSizeFromCenter(leftCenter, { size: ctrlSize, angle: totalAngle });

  const topLeftSize = createControllerMaterialSizeFromCenter(topLeftCenter, { size: ctrlSize, angle: totalAngle });
  const topRightSize = createControllerMaterialSizeFromCenter(topRightCenter, { size: ctrlSize, angle: totalAngle });
  const bottomLeftSize = createControllerMaterialSizeFromCenter(bottomLeftCenter, {
    size: ctrlSize,
    angle: totalAngle,
  });
  const bottomRightSize = createControllerMaterialSizeFromCenter(bottomRightCenter, {
    size: ctrlSize,
    angle: totalAngle,
  });

  const topLeftVertexes = calcMaterialVertexes(topLeftSize);
  const topRightVertexes = calcMaterialVertexes(topRightSize);
  const bottomLeftVertexes = calcMaterialVertexes(bottomLeftSize);
  const bottomRightVertexes = calcMaterialVertexes(bottomRightSize);

  const topVertexes: ViewRectVertexes = [
    topLeftVertexes[1],
    topRightVertexes[0],
    topRightVertexes[3],
    topLeftVertexes[2],
  ];
  const rightVertexes: ViewRectVertexes = [
    topRightVertexes[3],
    topRightVertexes[2],
    bottomRightVertexes[1],
    bottomRightVertexes[0],
  ];
  const bottomVertexes: ViewRectVertexes = [
    bottomLeftVertexes[1],
    bottomRightVertexes[0],
    bottomRightVertexes[3],
    bottomLeftVertexes[2],
  ];
  const leftVertexes: ViewRectVertexes = [
    topLeftVertexes[3],
    topLeftVertexes[2],
    bottomLeftVertexes[1],
    bottomLeftVertexes[0],
  ];

  const topMiddleVertexes = calcMaterialVertexes(topMiddleSize);
  const rightMiddleVertexes = calcMaterialVertexes(rightMiddleSize);
  const bottomMiddleVertexes = calcMaterialVertexes(bottomMiddleSize);
  const leftMiddleVertexes = calcMaterialVertexes(leftMiddleSize);

  const rotateCenter = getCenterFromTwoPoints(rotateMaterialVertexes[0], rotateMaterialVertexes[1]);
  // TODO
  const tempRotateSizeRepairRatio = 1.1;
  const rotateSize = createControllerMaterialSizeFromCenter(rotateCenter, {
    size: (rotateControllerSize * tempRotateSizeRepairRatio) / viewScaleInfo.scale,
    angle: totalAngle,
  });
  const rotateVertexes = calcMaterialVertexes(rotateSize);

  const sizeController: MaterialSizeController = {
    originalMaterialCenter: calcMaterialCenter(mtrlSize),
    originalMaterialSize: { ...mtrlSize },
    materialWrapper: vertexes,
    left: {
      type: 'left',
      vertexes: leftVertexes,
      center: leftCenter,
      size: ctrlSize,
    },
    right: {
      type: 'right',
      vertexes: rightVertexes,
      center: rightCenter,
      size: ctrlSize,
    },
    top: {
      type: 'top',
      vertexes: topVertexes,
      center: topCenter,
      size: ctrlSize,
    },
    bottom: {
      type: 'bottom',
      vertexes: bottomVertexes,
      center: bottomCenter,
      size: ctrlSize,
    },
    topLeft: {
      type: 'top-left',
      vertexes: topLeftVertexes,
      center: topLeftCenter,
      size: ctrlSize,
    },
    topRight: {
      type: 'top-right',
      vertexes: topRightVertexes,
      center: topRightCenter,
      size: ctrlSize,
    },
    bottomLeft: {
      type: 'bottom-left',
      vertexes: bottomLeftVertexes,
      center: bottomLeftCenter,
      size: ctrlSize,
    },
    bottomRight: {
      type: 'bottom-right',
      vertexes: bottomRightVertexes,
      center: bottomRightCenter,
      size: ctrlSize,
    },
    leftMiddle: {
      type: 'left-middle',
      vertexes: leftMiddleVertexes,
      center: leftCenter,
      size: ctrlSize,
    },
    rightMiddle: {
      type: 'right-middle',
      vertexes: rightMiddleVertexes,
      center: rightCenter,
      size: ctrlSize,
    },
    topMiddle: {
      type: 'top-middle',
      vertexes: topMiddleVertexes,
      center: topCenter,
      size: ctrlSize,
    },
    bottomMiddle: {
      type: 'bottom-middle',
      vertexes: bottomMiddleVertexes,
      center: bottomCenter,
      size: ctrlSize,
    },
    rotate: {
      type: 'rotate',
      vertexes: rotateVertexes,
      center: rotateCenter,
      size: rotateControllerSize,
    },
  };
  return sizeController;
}

export function calcLayoutSizeController(
  layoutSize: Pick<MaterialSize, 'x' | 'y' | 'width' | 'height'>,
  opts: {
    controllerSize?: number;
    viewScaleInfo: ViewScaleInfo;
  }
): LayoutSizeController {
  const { controllerSize, viewScaleInfo } = opts;

  const ctrlSize = controllerSize && controllerSize > 0 ? controllerSize : 8;

  const { x, y, width, height } = calcViewMaterialSize(layoutSize, { viewScaleInfo });
  const center = calcMaterialCenter({ x, y, width, height });

  const topCenter = { x: center.x, y };
  const rightCenter = { x: x + width, y: center.y };
  const bottomCenter = { x: center.x, y: y + height };
  const leftCenter = { x, y: center.y };

  const topLeftCenter = { x, y };
  const topRightCenter = { x: x + width, y };
  const bottomRightCenter = { x: x + width, y: y + height };
  const bottomLeftCenter = { x, y: y + height };

  const topMiddleSize = createControllerMaterialSizeFromCenter(topCenter, { size: ctrlSize, angle: 0 });
  const rightMiddleSize = createControllerMaterialSizeFromCenter(rightCenter, { size: ctrlSize, angle: 0 });
  const bottomMiddleSize = createControllerMaterialSizeFromCenter(bottomCenter, { size: ctrlSize, angle: 0 });
  const leftMiddleSize = createControllerMaterialSizeFromCenter(leftCenter, { size: ctrlSize, angle: 0 });

  const topLeftSize = createControllerMaterialSizeFromCenter(topLeftCenter, { size: ctrlSize, angle: 0 });
  const topRightSize = createControllerMaterialSizeFromCenter(topRightCenter, { size: ctrlSize, angle: 0 });
  const bottomLeftSize = createControllerMaterialSizeFromCenter(bottomLeftCenter, { size: ctrlSize, angle: 0 });
  const bottomRightSize = createControllerMaterialSizeFromCenter(bottomRightCenter, { size: ctrlSize, angle: 0 });

  const topLeftVertexes = calcMaterialVertexes(topLeftSize);
  const topRightVertexes = calcMaterialVertexes(topRightSize);
  const bottomLeftVertexes = calcMaterialVertexes(bottomLeftSize);
  const bottomRightVertexes = calcMaterialVertexes(bottomRightSize);

  const topVertexes: ViewRectVertexes = [
    topLeftVertexes[1],
    topRightVertexes[0],
    topRightVertexes[3],
    topLeftVertexes[2],
  ];
  const rightVertexes: ViewRectVertexes = [
    topRightVertexes[3],
    topRightVertexes[2],
    bottomRightVertexes[1],
    bottomRightVertexes[0],
  ];
  const bottomVertexes: ViewRectVertexes = [
    bottomLeftVertexes[1],
    bottomRightVertexes[0],
    bottomRightVertexes[3],
    bottomLeftVertexes[2],
  ];
  const leftVertexes: ViewRectVertexes = [
    topLeftVertexes[3],
    topLeftVertexes[2],
    bottomLeftVertexes[1],
    bottomLeftVertexes[0],
  ];

  const topMiddleVertexes = calcMaterialVertexes(topMiddleSize);
  const rightMiddleVertexes = calcMaterialVertexes(rightMiddleSize);
  const bottomMiddleVertexes = calcMaterialVertexes(bottomMiddleSize);
  const leftMiddleVertexes = calcMaterialVertexes(leftMiddleSize);

  const sizeController: LayoutSizeController = {
    left: {
      type: 'left',
      vertexes: leftVertexes,
      center: leftCenter,
      size: ctrlSize,
    },
    right: {
      type: 'right',
      vertexes: rightVertexes,
      center: rightCenter,
      size: ctrlSize,
    },
    top: {
      type: 'top',
      vertexes: topVertexes,
      center: topCenter,
      size: ctrlSize,
    },
    bottom: {
      type: 'bottom',
      vertexes: bottomVertexes,
      center: bottomCenter,
      size: ctrlSize,
    },
    topLeft: {
      type: 'top-left',
      vertexes: topLeftVertexes,
      center: topLeftCenter,
      size: ctrlSize,
    },
    topRight: {
      type: 'top-right',
      vertexes: topRightVertexes,
      center: topRightCenter,
      size: ctrlSize,
    },
    bottomLeft: {
      type: 'bottom-left',
      vertexes: bottomLeftVertexes,
      center: bottomLeftCenter,
      size: ctrlSize,
    },
    bottomRight: {
      type: 'bottom-right',
      vertexes: bottomRightVertexes,
      center: bottomRightCenter,
      size: ctrlSize,
    },
    leftMiddle: {
      type: 'left-middle',
      vertexes: leftMiddleVertexes,
      center: leftCenter,
      size: ctrlSize,
    },
    rightMiddle: {
      type: 'right-middle',
      vertexes: rightMiddleVertexes,
      center: rightCenter,
      size: ctrlSize,
    },
    topMiddle: {
      type: 'top-middle',
      vertexes: topMiddleVertexes,
      center: topCenter,
      size: ctrlSize,
    },
    bottomMiddle: {
      type: 'bottom-middle',
      vertexes: bottomMiddleVertexes,
      center: bottomCenter,
      size: ctrlSize,
    },
  };
  return sizeController;
}
