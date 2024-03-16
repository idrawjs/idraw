import type { Data, Element, PointSize, ViewRectInfo, ViewScaleInfo, ViewSizeInfo, ViewCalculator } from '@idraw/types';
import { is } from '@idraw/util';

type DotMap = Record<number, number[]>;

type YLine = {
  x: number;
  yList: number[];
};

type XLine = {
  xList: number[];
  y: number;
};

interface ViewBoxInfo {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  midX: number;
  midY: number;
}

const unitSize = 2; // px

function getViewBoxInfo(rectInfo: ViewRectInfo): ViewBoxInfo {
  const boxInfo: ViewBoxInfo = {
    minX: rectInfo.topLeft.x,
    minY: rectInfo.topLeft.y,
    maxX: rectInfo.bottomRight.x,
    maxY: rectInfo.bottomRight.y,
    midX: rectInfo.center.x,
    midY: rectInfo.center.y
  };
  return boxInfo;
}

const getClosestNumInSortedKeys = (sortedKeys: number[], target: number) => {
  if (sortedKeys.length === 0) {
    throw null;
  }
  if (sortedKeys.length === 1) {
    return sortedKeys[0];
  }

  let left = 0;
  let right = sortedKeys.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (sortedKeys[mid] === target) {
      return sortedKeys[mid];
    } else if (sortedKeys[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  if (left >= sortedKeys.length) {
    return sortedKeys[right];
  }
  if (right < 0) {
    return sortedKeys[left];
  }

  return Math.abs(sortedKeys[right] - target) <= Math.abs(sortedKeys[left] - target) ? sortedKeys[right] : sortedKeys[left];
};

const isEqualNum = (a: number, b: number) => Math.abs(a - b) < 0.00001;

export function calcReferenceInfo(
  uuid: string,
  opts: {
    data: Data;
    groupQueue: Element<'group'>[];
    calculator: ViewCalculator;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
  }
) {
  const { data, groupQueue, calculator, viewScaleInfo, viewSizeInfo } = opts;
  let targetElements: Element[] = data.elements || [];
  if (groupQueue?.length > 0) {
    targetElements = (groupQueue[groupQueue.length - 1] as Element<'group'>)?.detail?.children || [];
  }
  const siblingViewRectInfoList: ViewRectInfo[] = [];
  targetElements.forEach((elem: Element) => {
    if (elem.uuid !== uuid) {
      const info = calculator.calcViewRectInfoFromRange(elem.uuid, { checkVisible: true, viewScaleInfo, viewSizeInfo });
      if (info) {
        siblingViewRectInfoList.push(info);
      }
    }
  });

  const targetRectInfo = calculator.calcViewRectInfoFromRange(uuid, { viewScaleInfo, viewSizeInfo });

  if (!targetRectInfo) {
    return null;
  }

  const vTargetLineDotMap: DotMap = {}; // target vertical line dots
  const hTargetLineDotMap: DotMap = {}; // target horizontal line dots

  const vRefLineDotMap: DotMap = {}; // reference vertical line dots
  const hRefLineDotMap: DotMap = {}; // reference horizontal line dots

  const vHelperLineDotMapList: YLine[] = []; // vertical line list
  const hHelperLineDotMapList: XLine[] = []; // horizontal line list

  let sortedRefXKeys: number[] = []; // hRefLineDotMap key nums
  let sortedRefYKeys: number[] = []; // vRefLineDotMap key nums

  const targetBox = getViewBoxInfo(targetRectInfo);

  vTargetLineDotMap[targetBox.minX] = [targetBox.minY, targetBox.midY, targetBox.maxY];
  vTargetLineDotMap[targetBox.midX] = [targetBox.minY, targetBox.midY, targetBox.maxY];
  vTargetLineDotMap[targetBox.maxX] = [targetBox.minY, targetBox.midY, targetBox.maxY];

  hTargetLineDotMap[targetBox.minY] = [targetBox.minX, targetBox.midX, targetBox.maxX];
  hTargetLineDotMap[targetBox.midY] = [targetBox.minX, targetBox.midX, targetBox.maxX];
  hTargetLineDotMap[targetBox.maxY] = [targetBox.minX, targetBox.midX, targetBox.maxX];

  siblingViewRectInfoList.forEach((info) => {
    const box = getViewBoxInfo(info);
    if (!vRefLineDotMap[box.minX]) {
      vRefLineDotMap[box.minX] = [];
    }
    if (!vRefLineDotMap[box.midX]) {
      vRefLineDotMap[box.midX] = [];
    }
    if (!vRefLineDotMap[box.maxX]) {
      vRefLineDotMap[box.maxX] = [];
    }
    if (!hRefLineDotMap[box.minY]) {
      hRefLineDotMap[box.minY] = [];
    }
    if (!hRefLineDotMap[box.midY]) {
      hRefLineDotMap[box.midY] = [];
    }
    if (!hRefLineDotMap[box.maxY]) {
      hRefLineDotMap[box.maxY] = [];
    }

    vRefLineDotMap[box.minX] = [box.minY, box.midY, box.maxY];
    vRefLineDotMap[box.midX] = [box.minY, box.midY, box.maxY];
    vRefLineDotMap[box.maxX] = [box.minY, box.midY, box.maxY];

    sortedRefXKeys.push(box.minX);
    sortedRefXKeys.push(box.midX);
    sortedRefXKeys.push(box.maxX);

    hRefLineDotMap[box.minY] = [box.minX, box.midX, box.maxX];
    hRefLineDotMap[box.midY] = [box.minX, box.midX, box.maxX];
    hRefLineDotMap[box.maxY] = [box.minX, box.midX, box.maxX];

    sortedRefYKeys.push(box.minY);
    sortedRefYKeys.push(box.midY);
    sortedRefYKeys.push(box.maxY);
  });

  sortedRefXKeys = sortedRefXKeys.sort((a, b) => a - b);
  sortedRefYKeys = sortedRefYKeys.sort((a, b) => a - b);

  let offsetX: number | null = null;
  let offsetY: number | null = null;
  let closestMinX: number | null = null;
  let closestMidX: number | null = null;
  let closestMaxX: number | null = null;
  let closestMinY: number | null = null;
  let closestMidY: number | null = null;
  let closestMaxY: number | null = null;

  if (sortedRefXKeys.length > 0) {
    closestMinX = getClosestNumInSortedKeys(sortedRefXKeys, targetBox.minX);
    closestMidX = getClosestNumInSortedKeys(sortedRefXKeys, targetBox.midX);
    closestMaxX = getClosestNumInSortedKeys(sortedRefXKeys, targetBox.maxX);

    const distMinX = Math.abs(closestMinX - targetBox.minX);
    const distMidX = Math.abs(closestMidX - targetBox.midX);
    const distMaxX = Math.abs(closestMaxX - targetBox.maxX);
    const closestXDist = Math.min(distMinX, distMidX, distMaxX);

    if (closestXDist <= unitSize / viewScaleInfo.scale) {
      if (isEqualNum(closestXDist, distMinX)) {
        offsetX = closestMinX - targetBox.minX;
      } else if (isEqualNum(closestXDist, distMidX)) {
        offsetX = closestMidX - targetBox.midX;
      } else if (isEqualNum(closestXDist, distMaxX)) {
        offsetX = closestMaxX - targetBox.maxX;
      }
    }
  }

  if (sortedRefYKeys.length > 0) {
    closestMinY = getClosestNumInSortedKeys(sortedRefYKeys, targetBox.minY);
    closestMidY = getClosestNumInSortedKeys(sortedRefYKeys, targetBox.midY);
    closestMaxY = getClosestNumInSortedKeys(sortedRefYKeys, targetBox.maxY);

    const distMinY = Math.abs(closestMinY - targetBox.minY);
    const distMidY = Math.abs(closestMidY - targetBox.midY);
    const distMaxY = Math.abs(closestMaxY - targetBox.maxY);
    const closestYDist = Math.min(distMinY, distMidY, distMaxY);

    if (closestYDist <= unitSize / viewScaleInfo.scale) {
      if (isEqualNum(closestYDist, distMinY)) {
        offsetY = closestMinY - targetBox.minY;
      } else if (isEqualNum(closestYDist, distMidY)) {
        offsetY = closestMidY - targetBox.midY;
      } else if (isEqualNum(closestYDist, distMaxY)) {
        offsetY = closestMaxY - targetBox.maxY;
      }
    }
  }

  const newTargetBox = { ...targetBox };
  if (offsetX !== null) {
    newTargetBox.minX += offsetX;
    newTargetBox.midX += offsetX;
    newTargetBox.maxX += offsetX;
  }
  if (offsetY !== null) {
    newTargetBox.minY += offsetY;
    newTargetBox.midY += offsetY;
    newTargetBox.maxY += offsetY;
  }

  if (is.x(offsetX) && offsetX !== null && closestMinX !== null && closestMidX !== null && closestMaxX !== null) {
    if (isEqualNum(offsetX, closestMinX - targetBox.minX)) {
      const vLine: YLine = {
        x: closestMinX,
        yList: []
      };
      vLine.yList.push(newTargetBox.minY);
      vLine.yList.push(newTargetBox.midY);
      vLine.yList.push(newTargetBox.maxY);
      vLine.yList.push(...(hRefLineDotMap?.[closestMinX] || []));
      vHelperLineDotMapList.push(vLine);
    }

    if (isEqualNum(offsetX, closestMidX - targetBox.minX)) {
      const vLine: YLine = {
        x: closestMidX,
        yList: []
      };
      vLine.yList.push(newTargetBox.minY);
      vLine.yList.push(newTargetBox.midY);
      vLine.yList.push(newTargetBox.maxY);
      vLine.yList.push(...(hRefLineDotMap?.[closestMidX] || []));
      vHelperLineDotMapList.push(vLine);
    }

    if (isEqualNum(offsetX, closestMaxX - targetBox.minX)) {
      const vLine: YLine = {
        x: closestMaxX,
        yList: []
      };
      vLine.yList.push(newTargetBox.minY);
      vLine.yList.push(newTargetBox.midY);
      vLine.yList.push(newTargetBox.maxY);
      vLine.yList.push(...(hRefLineDotMap?.[closestMaxX] || []));
      vHelperLineDotMapList.push(vLine);
    }
  }

  if (is.y(offsetY) && offsetY !== null && closestMinY !== null && closestMidY !== null && closestMaxY !== null) {
    if (isEqualNum(offsetY, closestMinY - targetBox.minY)) {
      const hLine: XLine = {
        y: closestMinY,
        xList: []
      };
      hLine.xList.push(newTargetBox.minX);
      hLine.xList.push(newTargetBox.midX);
      hLine.xList.push(newTargetBox.maxX);
      hLine.xList.push(...(vRefLineDotMap?.[closestMinY] || []));
      hHelperLineDotMapList.push(hLine);
    }
    if (isEqualNum(offsetY, closestMidY - targetBox.midY)) {
      const hLine: XLine = {
        y: closestMidY,
        xList: []
      };
      hLine.xList.push(newTargetBox.minX);
      hLine.xList.push(newTargetBox.midX);
      hLine.xList.push(newTargetBox.maxX);
      hLine.xList.push(...(vRefLineDotMap?.[closestMinY] || []));
      hHelperLineDotMapList.push(hLine);
    }
    if (isEqualNum(offsetY, closestMaxY - targetBox.maxY)) {
      const hLine: XLine = {
        y: closestMaxY,
        xList: []
      };
      hLine.xList.push(newTargetBox.minX);
      hLine.xList.push(newTargetBox.midX);
      hLine.xList.push(newTargetBox.maxX);
      hLine.xList.push(...(vRefLineDotMap?.[closestMaxY] || []));
      hHelperLineDotMapList.push(hLine);
    }
  }

  const yLines: Array<PointSize[]> = [];
  if (vHelperLineDotMapList?.length > 0) {
    vHelperLineDotMapList.forEach((item, i) => {
      yLines.push([]);
      item.yList.forEach((y) => {
        yLines[i].push({
          x: item.x,
          y
        });
      });
    });
  }

  const xLines: Array<PointSize[]> = [];
  if (hHelperLineDotMapList?.length > 0) {
    hHelperLineDotMapList.forEach((item, i) => {
      xLines.push([]);
      item.xList.forEach((x) => {
        xLines[i].push({
          x,
          y: item.y
        });
      });
    });
  }

  return {
    offsetX,
    offsetY,
    yLines,
    xLines
  };
}
