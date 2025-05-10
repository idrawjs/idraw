import type { BoxInfo, Element, PointSize } from '@idraw/types';
import { is } from './is';

export function elementToBoxInfo(elem: Element): BoxInfo {
  const { x, y, w, h, detail } = elem;
  const { borderWidth, borderRadius, boxSizing } = detail;
  let btw: number = 0; // border-top-width
  let brw: number = 0; // border-right-width
  let bbw: number = 0; // border-bottom-width
  let blw: number = 0; // border-left-width

  let btlr: number = 0; // border-top-left-radius
  let btrr: number = 0; // border-top-right-radius
  let bblr: number = 0; // border-bottom-left-radius
  let bbrr: number = 0; // border-bottom-right-radius

  if (typeof borderWidth === 'number' && borderWidth > 0) {
    btw = borderWidth;
    brw = borderWidth;
    bbw = borderWidth;
    blw = borderWidth;
  } else if (Array.isArray(borderWidth)) {
    btw = is.positiveNum(borderWidth[0]) ? borderWidth[0] : 0;
    brw = is.positiveNum(borderWidth[1]) ? borderWidth[0] : 0;
    bbw = is.positiveNum(borderWidth[2]) ? borderWidth[0] : 0;
    blw = is.positiveNum(borderWidth[3]) ? borderWidth[0] : 0;
  }

  if (typeof borderRadius === 'number' && borderRadius > 0) {
    btlr = borderRadius;
    btrr = borderRadius;
    bblr = borderRadius;
    bbrr = borderRadius;
  } else if (Array.isArray(borderRadius)) {
    btlr = is.positiveNum(borderRadius[0]) ? borderRadius[0] : 0;
    btrr = is.positiveNum(borderRadius[0]) ? borderRadius[0] : 0;
    bblr = is.positiveNum(borderRadius[0]) ? borderRadius[0] : 0;
    bbrr = is.positiveNum(borderRadius[0]) ? borderRadius[0] : 0;
  }
  const p0: PointSize = { x: x, y: y }; // pointer border-top-left
  const p1: PointSize = { x: x + w, y: y }; // pointer border-top-right
  const p2: PointSize = { x: x + w, y: y + h }; // pointer border-bottom-right
  const p3: PointSize = { x: x, y: y + h }; // pointer border-bottom-left

  const p0s: PointSize = { x: x, y: y + btlr }; // pointer border-top-left start
  const p0e: PointSize = { x: x + btlr, y: y }; // pointer border-top-left end
  const p1s: PointSize = { x: x + w - btrr, y: y }; // pointer border-top-right start
  const p1e: PointSize = { x: x + w, y: y + btrr }; // pointer border-top-right start
  const p2s: PointSize = { x: x + w, y: y + h - bbrr }; // pointer border-bottom-right start
  const p2e: PointSize = { x: x + w - bbrr, y: y + h }; // pointer border-bottom-right end
  const p3s: PointSize = { x: x + bblr, y: y + h }; // pointer border-bottom-left start
  const p3e: PointSize = { x: x, y: y + h - bblr }; // pointer border-bottom-left end

  let op0: PointSize = { ...p0 }; // outer pointer border-top-left
  let op1: PointSize = { ...p1 }; // outer pointer border-top-right
  let op2: PointSize = { ...p2 }; // outer pointer border-bottom-right
  let op3: PointSize = { ...p3 }; // outer pointer border-bottom-left

  let op0s: PointSize = { ...p0s }; // outer pointer border-top-left start
  let op0e: PointSize = { ...p0e }; // outer pointer border-top-left end
  let op1s: PointSize = { ...p1s }; // outer pointer border-top-right start
  let op1e: PointSize = { ...p1e }; // outer pointer border-top-right start
  let op2s: PointSize = { ...p2s }; // outer pointer border-bottom-right start
  let op2e: PointSize = { ...p2e }; // outer pointer border-bottom-right end
  let op3s: PointSize = { ...p3s }; // outer pointer border-bottom-left start
  let op3e: PointSize = { ...p3e }; // outer pointer border-bottom-left end

  let ip0: PointSize = { ...p0 }; // inner pointer border-top-left
  let ip1: PointSize = { ...p1 }; // inner pointer border-top-right
  let ip2: PointSize = { ...p2 }; // inner pointer border-bottom-right
  let ip3: PointSize = { ...p3 }; // inner pointer border-bottom-left

  let ip0s: PointSize = { ...p0s }; // inner pointer border-top-left start
  let ip0e: PointSize = { ...p0e }; // inner pointer border-top-left end
  let ip1s: PointSize = { ...p1s }; // inner pointer border-top-right start
  let ip1e: PointSize = { ...p1e }; // inner pointer border-top-right start
  let ip2s: PointSize = { ...p2s }; // inner pointer border-bottom-right start
  let ip2e: PointSize = { ...p2e }; // inner pointer border-bottom-right end
  let ip3s: PointSize = { ...p3s }; // inner pointer border-bottom-left start
  let ip3e: PointSize = { ...p3e }; // inner pointer border-bottom-left end

  if (boxSizing === 'border-box') {
    ip0 = { x: ip0.x + blw, y: ip0.y + btw };
    ip1 = { x: ip1.x - brw, y: ip1.y + btw };
    ip2 = { x: ip2.x - brw, y: ip2.y - bbw };
    ip3 = { x: ip3.x + blw, y: ip3.y - bbw };
    ip0s = { x: ip0s.x + blw, y: ip0s.y + btw };
    ip0e = { x: ip0e.x + blw, y: ip0e.y + btw };
    ip1s = { x: ip1s.x - brw, y: ip1s.y + btw };
    ip1e = { x: ip1e.x - brw, y: ip1e.y + btw };
    ip2s = { x: ip2s.x - brw, y: ip2s.y - bbw };
    ip2e = { x: ip2e.x - brw, y: ip2e.y - bbw };
    ip3s = { x: ip3s.x + blw, y: ip3s.y - bbw };
    ip3e = { x: ip3e.x + blw, y: ip3e.y - bbw };
  } else if (boxSizing === 'content-box') {
    op0 = { x: op0.x - blw, y: op0.y - btw };
    op1 = { x: op1.x + brw, y: op1.y - btw };
    op2 = { x: op2.x + brw, y: op2.y + bbw };
    op3 = { x: op3.x - blw, y: op3.y + bbw };
    op0s = { x: op0s.x - blw, y: op0s.y - btw };
    op0e = { x: op0e.x - blw, y: op0e.y - btw };
    op1s = { x: op1s.x + brw, y: op1s.y - btw };
    op1e = { x: op1e.x + brw, y: op1e.y - btw };
    op2s = { x: op2s.x + brw, y: op2s.y + bbw };
    op2e = { x: op2e.x + brw, y: op2e.y + bbw };
    op3s = { x: op3s.x - blw, y: op3s.y + bbw };
    op3e = { x: op3e.x - blw, y: op3e.y + bbw };
  } else {
    ip0 = { x: ip0.x + blw / 2, y: ip0.y + btw / 2 };
    ip1 = { x: ip1.x - brw / 2, y: ip1.y + btw / 2 };
    ip2 = { x: ip2.x - brw / 2, y: ip2.y - bbw / 2 };
    ip3 = { x: ip3.x + blw / 2, y: ip3.y - bbw / 2 };
    ip0s = { x: ip0s.x + blw / 2, y: ip0s.y + btw / 2 };
    ip0e = { x: ip0e.x + blw / 2, y: ip0e.y + btw / 2 };
    ip1s = { x: ip1s.x - brw / 2, y: ip1s.y + btw / 2 };
    ip1e = { x: ip1e.x - brw / 2, y: ip1e.y + btw / 2 };
    ip2s = { x: ip2s.x - brw / 2, y: ip2s.y - bbw / 2 };
    ip2e = { x: ip2e.x - brw / 2, y: ip2e.y - bbw / 2 };
    ip3s = { x: ip3s.x + blw / 2, y: ip3s.y - bbw / 2 };
    ip3e = { x: ip3e.x + blw / 2, y: ip3e.y - bbw / 2 };

    op0 = { x: op0.x - blw / 2, y: op0.y - btw / 2 };
    op1 = { x: op1.x + brw / 2, y: op1.y - btw / 2 };
    op2 = { x: op2.x + brw / 2, y: op2.y + bbw / 2 };
    op3 = { x: op3.x - blw / 2, y: op3.y + bbw / 2 };
    op0s = { x: op0s.x - blw / 2, y: op0s.y - btw / 2 };
    op0e = { x: op0e.x - blw / 2, y: op0e.y - btw / 2 };
    op1s = { x: op1s.x + brw / 2, y: op1s.y - btw / 2 };
    op1e = { x: op1e.x + brw / 2, y: op1e.y - btw / 2 };
    op2s = { x: op2s.x + brw / 2, y: op2s.y + bbw / 2 };
    op2e = { x: op2e.x + brw / 2, y: op2e.y + bbw / 2 };
    op3s = { x: op3s.x - blw / 2, y: op3s.y + bbw / 2 };
    op3e = { x: op3e.x - blw / 2, y: op3e.y + bbw / 2 };
  }

  return {
    btw,
    brw,
    bbw,
    blw,

    btlr,
    btrr,
    bblr,
    bbrr,

    p0,
    p1,
    p2,
    p3,
    p0s,
    p0e,
    p1s,
    p1e,
    p2s,
    p2e,
    p3s,
    p3e,

    op0,
    op1,
    op2,
    op3,
    op0s,
    op0e,
    op1s,
    op1e,
    op2s,
    op2e,
    op3s,
    op3e,

    ip0,
    ip1,
    ip2,
    ip3,
    ip0s,
    ip0e,
    ip1s,
    ip1e,
    ip2s,
    ip2e,
    ip3s,
    ip3e
  };
}
