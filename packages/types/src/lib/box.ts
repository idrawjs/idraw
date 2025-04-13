import type { PointSize } from './point';

export type BoxInfo = {
  // p0: PointSize; // top-left
  // p1: PointSize; // top-right
  // p2: PointSize; // bottom-right
  // p3: PointSize; // bottom-left

  btw: number; // border-top-width
  brw: number; // border-right-width
  bbw: number; // border-bottom-width
  blw: number; // border-left-width
  btlr: number; // border-top-left-radius
  btrr: number; // border-top-right-radius
  bblr: number; // border-bottom-left-radius
  bbrr: number; // border-bottom-right-radius

  p0: PointSize; // pointer border-top-left
  p1: PointSize; // pointer border-top-right
  p2: PointSize; // pointer border-bottom-right
  p3: PointSize; // pointer border-bottom-left
  p0s: PointSize; // pointer border-top-left start
  p0e: PointSize; // pointer border-top-left end
  p1s: PointSize; // pointer border-top-right start
  p1e: PointSize; // pointer border-top-right start
  p2s: PointSize; // pointer border-bottom-right start
  p2e: PointSize; // pointer border-bottom-right end
  p3s: PointSize; // pointer border-bottom-left start
  p3e: PointSize; // pointer border-bottom-left end

  op0: PointSize; // outer pointer border-top-left
  op1: PointSize; // outer pointer border-top-right
  op2: PointSize; // outer pointer border-bottom-right
  op3: PointSize; // outer pointer border-bottom-left
  op0s: PointSize; // outer pointer border-top-left start
  op0e: PointSize; // outer pointer border-top-left end
  op1s: PointSize; // outer pointer border-top-right start
  op1e: PointSize; // outer pointer border-top-right start
  op2s: PointSize; // outer pointer border-bottom-right start
  op2e: PointSize; // outer pointer border-bottom-right end
  op3s: PointSize; // outer pointer border-bottom-left start
  op3e: PointSize; // outer pointer border-bottom-left end

  ip0: PointSize; // inner pointer border-top-left
  ip1: PointSize; // inner pointer border-top-right
  ip2: PointSize; // inner pointer border-bottom-right
  ip3: PointSize; // inner pointer border-bottom-left
  ip0s: PointSize; // inner pointer border-top-left start
  ip0e: PointSize; // inner pointer border-top-left end
  ip1s: PointSize; // inner pointer border-top-right start
  ip1e: PointSize; // inner pointer border-top-right start
  ip2s: PointSize; // inner pointer border-bottom-right start
  ip2e: PointSize; // inner pointer border-bottom-right end
  ip3s: PointSize; // inner pointer border-bottom-left start
  ip3e: PointSize; // inner pointer border-bottom-left end
};
