import type { Matrix } from '@idraw/types';

/**
 
| x_sc  y_sk  0  |
| x_sk  y_sc  0  |
| x_tr  y_tr  1  |

https://stackoverflow.com/questions/5072271/get-angle-from-matrix

 */

export function matrixToRadian(matrix: Matrix): number | null {
  if (matrix[1] != -1 * matrix[3] || matrix[4] != matrix[0] || matrix[0] * matrix[4] - matrix[3] * matrix[1] != 1) {
    return null;
  } else {
    return Math.acos(matrix[0]);
  }
}

export function matrixToAngle(matrix: Matrix): number | null {
  const radian = matrixToRadian(matrix);
  if (typeof radian === 'number') {
    const angle = (radian * 180) / Math.PI;
    return angle;
  }
  return radian;
}
