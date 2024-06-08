// import { matrixInverse } from '../common/matrix-inverse';
// @ts-ignore
import matrixInverse from 'matrix-inverse';
import type { FigmaTransform } from '../types';

// https://github.com/figma-plugin-helper-functions/figma-plugin-helpers/blob/52136d7f7628ca704bb3905dc1e20f7ef50036f7/src/helpers/applyMatrixToPoint.ts
function applyMatrixToPoint(matrix: number[][], point: number[]) {
  return [point[0] * matrix[0][0] + point[1] * matrix[0][1] + matrix[0][2], point[0] * matrix[1][0] + point[1] * matrix[1][1] + matrix[1][2]];
}

// https://github.com/figma-plugin-helper-functions/figma-plugin-helpers/blob/52136d7f7628ca704bb3905dc1e20f7ef50036f7/src/helpers/extractLinearGradientStartEnd.ts
export function parseLinearGradientParamsFromTransform(shapeWidth: number, shapeHeight: number, figmatTransform: FigmaTransform) {
  const { m00, m01, m02, m10, m11, m12 } = figmatTransform;
  const t = [
    [m00, m01, m02],
    [m10, m11, m12]
  ];
  const transform = t.length === 2 ? [...t, [0, 0, 1]] : [...t];
  const mxInv = matrixInverse(transform);
  // const mxInv = transform;
  const startEnd = [
    [0, 0.5],
    [1, 0.5]
  ].map((p) => applyMatrixToPoint(mxInv, p));
  return {
    start: {
      x: startEnd[0][0] * shapeWidth,
      y: startEnd[0][1] * shapeHeight
    },

    end: {
      x: startEnd[1][0] * shapeWidth,
      y: startEnd[1][1] * shapeHeight
    }

    // start: {
    //   x: startEnd[0][0] * shapeWidth,
    //   y: startEnd[1][1] * shapeHeight
    // },

    // end: {
    //   x: startEnd[1][0] * shapeWidth,
    //   y: startEnd[0][1] * shapeHeight
    // }
  };
}

// https://github.com/figma-plugin-helper-functions/figma-plugin-helpers/blob/52136d7f7628ca704bb3905dc1e20f7ef50036f7/src/helpers/extractRadialOrDiamondGradientParams.ts
export function parseRadialOrDiamondGradientParamsFromTransform(shapeWidth: number, shapeHeight: number, figmatTransform: FigmaTransform) {
  const { m00, m01, m02, m10, m11, m12 } = figmatTransform;
  const t = [
    [m00, m01, m02],
    [m10, m11, m12]
  ];
  const transform = t.length === 2 ? [...t, [0, 0, 1]] : [...t];
  const mxInv = matrixInverse(transform);
  // const mxInv = transform;
  const centerPoint = applyMatrixToPoint(mxInv, [0.5, 0.5]);
  const rxPoint = applyMatrixToPoint(mxInv, [1, 0.5]);
  const ryPoint = applyMatrixToPoint(mxInv, [0.5, 1]);
  const rx = Math.sqrt(Math.pow(rxPoint[0] - centerPoint[0], 2) + Math.pow(rxPoint[1] - centerPoint[1], 2));
  const ry = Math.sqrt(Math.pow(ryPoint[0] - centerPoint[0], 2) + Math.pow(ryPoint[1] - centerPoint[1], 2));
  const angle = Math.atan((rxPoint[1] - centerPoint[1]) / (rxPoint[0] - centerPoint[0])) * (180 / Math.PI);
  return {
    rotation: angle,
    center: [centerPoint[0] * shapeWidth, centerPoint[1] * shapeHeight],
    radius: [rx * shapeWidth, ry * shapeHeight]
  };
}
