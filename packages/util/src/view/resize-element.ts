import type {
  Element,
  ElementSize,
  ElementOperations,
  ModifyRecord,
  FlattenLayout,
  FlattenElement
} from '@idraw/types';
import { istype } from '../tool/istype';
import { formatNumber } from '../tool/number';
import { toFlattenElement } from '../view/modify-record';

const doNum = (n: number) => {
  return formatNumber(n, { decimalPlaces: 4 });
};

type DeepResizeRatioOptions = {
  xRatio: number;
  yRatio: number;
  minRatio: number;
  maxRatio: number;
};

type FixedResizeOptions = {
  moveX: number;
  moveY: number;
  moveW: number;
  moveH: number;
};

function resizeElementBaseDetailByRatio(elem: Element, opts: DeepResizeRatioOptions): ModifyRecord<'modifyElement'> {
  const beforeElem: Pick<Element, 'detail'> = { detail: {} };
  const afterElem: Pick<Element, 'detail'> = { detail: {} };

  const record: ModifyRecord<'modifyElement'> = {
    type: 'modifyElement',
    time: Date.now(),
    content: {
      method: 'modifyElement',
      uuid: elem.uuid,
      before: null,
      after: null
    }
  };

  const { detail } = elem;
  const { xRatio, yRatio, maxRatio } = opts;
  const middleRatio = (xRatio + yRatio) / 2;
  const { borderWidth, borderRadius, borderDash, shadowOffsetX, shadowOffsetY, shadowBlur } = detail;
  if (typeof borderWidth === 'number') {
    detail.borderWidth = doNum(borderWidth * middleRatio);
    beforeElem.detail.borderWidth = borderWidth;
    afterElem.detail.borderWidth = detail.borderWidth;
  } else if (Array.isArray(detail.borderWidth)) {
    const bw = borderWidth as [number, number, number, number];
    // [top, right, bottom, left]
    detail.borderWidth = [doNum(bw[0] * yRatio), doNum(bw[1] * xRatio), doNum(bw[2] * yRatio), doNum(bw[3] * xRatio)];
    beforeElem.detail.borderWidth = [...bw];
    afterElem.detail.borderWidth = [...detail.borderWidth];
  }

  if (typeof borderRadius === 'number') {
    detail.borderRadius = doNum(borderRadius * middleRatio);
    beforeElem.detail.borderRadius = borderRadius;
    afterElem.detail.borderRadius = detail.borderRadius;
  } else if (Array.isArray(detail.borderRadius)) {
    const br = borderRadius as [number, number, number, number];
    // [top-left, top-right, bottom-left, bottom-right]
    detail.borderRadius = [br[0] * xRatio, br[1] * xRatio, br[2] * yRatio, br[3] * yRatio];
    beforeElem.detail.borderRadius = [...br];
    afterElem.detail.borderRadius = [...detail.borderRadius];
  }

  if (Array.isArray(borderDash)) {
    borderDash.forEach((dash: number, i) => {
      (detail.borderDash as number[])[i] = doNum(dash * maxRatio);
    });

    beforeElem.detail.borderDash = [...borderDash];
    afterElem.detail.borderDash = [...(detail.borderDash as number[])];
  }

  if (typeof shadowOffsetX === 'number') {
    detail.shadowOffsetX = doNum(shadowOffsetX * maxRatio);
    beforeElem.detail.shadowOffsetX = shadowOffsetX;
    afterElem.detail.shadowOffsetX = detail.shadowOffsetX;
  }
  if (typeof shadowOffsetY === 'number') {
    detail.shadowOffsetY = doNum(shadowOffsetY * maxRatio);
    beforeElem.detail.shadowOffsetY = shadowOffsetY;
    afterElem.detail.shadowOffsetY = detail.shadowOffsetY;
  }
  if (typeof shadowBlur === 'number') {
    detail.shadowBlur = doNum(shadowBlur * maxRatio);
    beforeElem.detail.shadowBlur = shadowBlur;
    afterElem.detail.shadowBlur = detail.shadowBlur;
  }

  record.content.before = toFlattenElement(beforeElem);
  record.content.after = toFlattenElement(afterElem);

  return record;
}

function resizeElementBaseByRatio(elem: Element, opts: DeepResizeRatioOptions): ModifyRecord<'modifyElement'> {
  const { xRatio, yRatio } = opts;
  const { uuid, x, y, w, h } = elem;
  elem.x = doNum(x * xRatio);
  elem.y = doNum(y * yRatio);
  elem.w = doNum(w * xRatio);
  elem.h = doNum(h * yRatio);
  const record: ModifyRecord<'modifyElement'> = {
    type: 'modifyElement',
    time: Date.now(),
    content: {
      method: 'modifyElement',
      uuid: uuid,
      before: { x, y, w, h },
      after: { x: elem.x, y: elem.y, w: elem.w, h: elem.h }
    }
  };

  const detailRecord = resizeElementBaseDetailByRatio(elem, opts);
  record.content.before = {
    ...record.content.before,
    ...detailRecord.content.before
  };
  record.content.after = {
    ...record.content.after,
    ...detailRecord.content.after
  };
  return record;
}

function resizeTextElementDetailByRatio(
  elem: Element<'text'>,
  opts: DeepResizeRatioOptions
): ModifyRecord<'modifyElement'> {
  const { minRatio, maxRatio } = opts;
  const { fontSize, lineHeight } = elem.detail;
  const ratio = (minRatio + maxRatio) / 2;

  const beforeFlattenElem: FlattenElement = {};
  const afterFlattenElem: FlattenElement = {};

  if (fontSize && fontSize > 0) {
    elem.detail.fontSize = doNum(fontSize * ratio);
    beforeFlattenElem['detail.fontSize'] = fontSize;
    afterFlattenElem['detail.fontSize'] = elem.detail.fontSize;
  }
  if (lineHeight && lineHeight > 0) {
    elem.detail.lineHeight = doNum(lineHeight * ratio);
    beforeFlattenElem['detail.lineHeight'] = lineHeight;
    afterFlattenElem['detail.lineHeight'] = elem.detail.lineHeight;
  }

  const record: ModifyRecord<'modifyElement'> = {
    type: 'modifyElement',
    time: Date.now(),
    content: {
      method: 'modifyElement',
      uuid: elem.uuid,
      before: beforeFlattenElem,
      after: afterFlattenElem
    }
  };

  return record;
}

function deepResizeElementByRatio(
  elem: Element,
  opts: DeepResizeRatioOptions,
  record?: ModifyRecord<'resizeElements'>
) {
  const { type, uuid } = elem;

  // base and rect
  const rootRecord = resizeElementBaseByRatio(elem, opts);
  const rootRecordBefore: FlattenLayout & { uuid: string } = { ...rootRecord.content.before, uuid };
  const rootRecordAfter: FlattenLayout & { uuid: string } = { ...rootRecord.content.after, uuid };

  record?.content.before.push(rootRecordBefore);
  record?.content.after.push(rootRecordAfter);

  if (type === 'circle') {
    // TODO
  } else if (type === 'text') {
    const textRecord = resizeTextElementDetailByRatio(elem as Element<'text'>, opts);
    Object.keys(textRecord.content.before || {}).forEach((key) => {
      rootRecordBefore[key] = textRecord.content.before?.[key];
    });
    Object.keys(textRecord.content.after || {}).forEach((key) => {
      rootRecordAfter[key] = textRecord.content.after?.[key];
    });
  } else if (type === 'image') {
    // TODO
  } else if (type === 'svg') {
    // TODO
  } else if (type === 'html') {
    // TODO
  } else if (type === 'path') {
    // TODO
  } else if (type === 'group' && Array.isArray((elem as Element<'group'>).detail.children)) {
    (elem as Element<'group'>).detail.children.forEach((child) => {
      deepResizeElementByRatio(child, opts, record);
    });
  }
}

function fixedResizeGroupElementChildren(
  elem: Element<'group'>,
  opts: FixedResizeOptions,
  record?: ModifyRecord<'resizeElements'>
) {
  if (!(elem.type === 'group' && Array.isArray(elem.detail.children))) {
    return;
  }
  const { moveX, moveY, moveH, moveW } = opts;
  let childChangedX = 0;
  let childChangedY = 0;
  let needReszieChildren = false;

  if ((moveX !== 0 || moveY !== 0) && (moveH !== 0 || moveW !== 0)) {
    needReszieChildren = true;

    childChangedX = -moveX;
    childChangedY = -moveY;
  }

  if (needReszieChildren !== true) {
    return;
  }

  elem.detail.children.forEach((child) => {
    const { uuid, x, y } = child;
    const afterX = x + childChangedX;
    const afterY = y + childChangedY;
    const before: FlattenLayout & { uuid: string } = { uuid, x, y };
    const after: FlattenLayout & { uuid: string } = { uuid, x: afterX, y: afterY };
    child.x = afterX;
    child.y = afterY;
    record?.content.before.push(before);
    record?.content.after.push(after);
  });
}

export function resizeEffectGroupElement(
  elem: Element<'group'>,
  size: Partial<ElementSize>,
  opts?: {
    resizeEffect?: ElementOperations['resizeEffect'];
  }
): ModifyRecord<'resizeElements'> | null {
  const record: ModifyRecord<'resizeElements'> = {
    type: 'resizeElements',
    time: Date.now(),
    content: {
      method: 'modifyElements',
      before: [],
      after: []
    }
  };

  const uuid = elem.uuid;
  const originX: number = elem.x;
  const originY: number = elem.y;
  const originW: number = elem.w;
  const originH: number = elem.h;

  const resizeX: number = (istype.number(size.x) ? size.x : elem.x) as number;
  const resizeY: number = (istype.number(size.y) ? size.y : elem.y) as number;
  const resizeW: number = (size.w && size.w > 0 ? size.w : elem.w) || 0;
  const resizeH: number = (size.h && size.h > 0 ? size.h : elem.h) || 0;

  const beforeGroupElem: FlattenLayout & { uuid: string } = { uuid, x: originX, y: originY, w: originW, h: originH };
  const afterGroupElem: FlattenLayout & { uuid: string } = { uuid, x: resizeX, y: resizeY, w: resizeW, h: resizeH };

  if (opts?.resizeEffect === 'deepResize') {
    record.content.before.push(beforeGroupElem);
    record.content.after.push(afterGroupElem);
    const xRatio = resizeW / elem.w;
    const yRatio = resizeH / elem.h;
    if (xRatio === yRatio && xRatio === 1) {
      return record;
    }

    const minRatio = Math.min(xRatio, yRatio);
    const maxRatio = Math.max(xRatio, yRatio);

    elem.w = resizeW;
    elem.h = resizeH;
    const resizeRadioOpts = { xRatio, yRatio, minRatio, maxRatio };
    if (elem.type === 'group' && Array.isArray(elem.detail.children)) {
      elem.detail.children.forEach((child) => {
        deepResizeElementByRatio(child, resizeRadioOpts, record);
      });
    }
    const groupDetailRecord = resizeElementBaseDetailByRatio(elem, resizeRadioOpts);
    Object.keys(groupDetailRecord.content.before || {}).forEach((key) => {
      beforeGroupElem[key] = groupDetailRecord.content.before?.[key];
    });
    Object.keys(groupDetailRecord.content.after || {}).forEach((key) => {
      afterGroupElem[key] = groupDetailRecord.content.after?.[key];
    });

    return record;
  }

  // fixed
  if (opts?.resizeEffect === 'fixed') {
    record.content.before.push(beforeGroupElem);
    record.content.after.push(afterGroupElem);

    const moveX = resizeX - elem.x;
    const moveY = resizeY - elem.y;
    const moveW = resizeW - elem.w;
    const moveH = resizeH - elem.h;
    fixedResizeGroupElementChildren(elem, { moveX, moveY, moveH, moveW }, record);

    elem.w = resizeW;
    elem.h = resizeH;
    elem.x = resizeX;
    elem.y = resizeY;
    return record;
  }

  // default  'absolute'
  elem.w = resizeW;
  elem.h = resizeH;
  elem.x = resizeX;
  elem.y = resizeY;
  record.content.before.push(beforeGroupElem);
  record.content.after.push(afterGroupElem);

  return record;
}
