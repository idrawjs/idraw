import type {
  StrictMaterial,
  MaterialSize,
  MaterialOperations,
  ModifyRecord,
  FlattenLayout,
  FlattenMaterial,
} from '@idraw/types';
import { istype } from '../tool/istype';
import { formatNumber } from '../tool/number';
import { toFlattenMaterial } from './modify-record';

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

function resizeMaterialBaseAttributesByRatio(
  mtrl: StrictMaterial,
  opts: DeepResizeRatioOptions
): ModifyRecord<'modifyMaterial'> {
  const beforeMtrl: Partial<StrictMaterial> = {};
  const afterMtrl: Partial<StrictMaterial> = {};

  const record: ModifyRecord<'modifyMaterial'> = {
    type: 'modifyMaterial',
    time: Date.now(),
    content: {
      method: 'modifyMaterial',
      id: mtrl.id,
      before: null,
      after: null,
    },
  };

  const { xRatio, yRatio, maxRatio } = opts;
  const middleRatio = (xRatio + yRatio) / 2;
  const { strokeWidth, cornerRadius, strokeDasharray, shadowOffsetX, shadowOffsetY, shadowBlur } = mtrl;
  if (typeof strokeWidth === 'number') {
    mtrl.strokeWidth = doNum(strokeWidth * middleRatio);
    beforeMtrl.strokeWidth = strokeWidth;
    afterMtrl.strokeWidth = mtrl.strokeWidth;
  } else if (Array.isArray(mtrl.strokeWidth)) {
    const bw = strokeWidth as [number, number, number, number];
    // [top, right, bottom, left]
    mtrl.strokeWidth = [doNum(bw[0] * yRatio), doNum(bw[1] * xRatio), doNum(bw[2] * yRatio), doNum(bw[3] * xRatio)];
    beforeMtrl.strokeWidth = [...bw];
    afterMtrl.strokeWidth = [...(strokeWidth as [number, number, number, number])];
  }

  if (typeof cornerRadius === 'number') {
    mtrl.cornerRadius = doNum(cornerRadius * middleRatio);
    beforeMtrl.cornerRadius = cornerRadius;
    afterMtrl.cornerRadius = mtrl.cornerRadius;
  } else if (Array.isArray(mtrl.cornerRadius)) {
    const br = cornerRadius as [number, number, number, number];
    // [top-left, top-right, bottom-left, bottom-right]
    mtrl.cornerRadius = [br[0] * xRatio, br[1] * xRatio, br[2] * yRatio, br[3] * yRatio];
    beforeMtrl.cornerRadius = [...br];
    afterMtrl.cornerRadius = [...(cornerRadius as [number, number, number, number])];
  }

  if (Array.isArray(strokeDasharray)) {
    strokeDasharray.forEach((dash: number, i) => {
      (mtrl.strokeDasharray as number[])[i] = doNum(dash * maxRatio);
    });

    beforeMtrl.strokeDasharray = [...strokeDasharray];
    afterMtrl.strokeDasharray = [...(mtrl.strokeDasharray as number[])];
  }

  if (typeof shadowOffsetX === 'number') {
    mtrl.shadowOffsetX = doNum(shadowOffsetX * maxRatio);
    beforeMtrl.shadowOffsetX = shadowOffsetX;
    afterMtrl.shadowOffsetX = mtrl.shadowOffsetX;
  }
  if (typeof shadowOffsetY === 'number') {
    mtrl.shadowOffsetY = doNum(shadowOffsetY * maxRatio);
    beforeMtrl.shadowOffsetY = shadowOffsetY;
    afterMtrl.shadowOffsetY = mtrl.shadowOffsetY;
  }
  if (typeof shadowBlur === 'number') {
    mtrl.shadowBlur = doNum(shadowBlur * maxRatio);
    beforeMtrl.shadowBlur = shadowBlur;
    afterMtrl.shadowBlur = mtrl.shadowBlur;
  }

  record.content.before = toFlattenMaterial(beforeMtrl);
  record.content.after = toFlattenMaterial(afterMtrl);

  return record;
}

function resizeMaterialBaseByRatio(mtrl: StrictMaterial, opts: DeepResizeRatioOptions): ModifyRecord<'modifyMaterial'> {
  const { xRatio, yRatio } = opts;
  const { id, x, y, width, height } = mtrl;
  mtrl.x = doNum(x * xRatio);
  mtrl.y = doNum(y * yRatio);
  mtrl.width = doNum(width * xRatio);
  mtrl.height = doNum(height * yRatio);
  const record: ModifyRecord<'modifyMaterial'> = {
    type: 'modifyMaterial',
    time: Date.now(),
    content: {
      method: 'modifyMaterial',
      id: id,
      before: { x, y, width, height },
      after: { x: mtrl.x, y: mtrl.y, width: mtrl.width, height: mtrl.height },
    },
  };

  const attributesRecord = resizeMaterialBaseAttributesByRatio(mtrl, opts);
  record.content.before = {
    ...record.content.before,
    ...attributesRecord.content.before,
  };
  record.content.after = {
    ...record.content.after,
    ...attributesRecord.content.after,
  };
  return record;
}

function resizeTextMaterialAttributesByRatio(
  mtrl: StrictMaterial<'text'>,
  opts: DeepResizeRatioOptions
): ModifyRecord<'modifyMaterial'> {
  const { minRatio, maxRatio } = opts;
  const { fontSize, lineHeight } = mtrl;
  const ratio = (minRatio + maxRatio) / 2;

  const beforeFlattenMtrl: FlattenMaterial = {};
  const afterFlattenMtrl: FlattenMaterial = {};

  if (fontSize && fontSize > 0) {
    mtrl.fontSize = doNum(fontSize * ratio);
    beforeFlattenMtrl['fontSize'] = fontSize;
    afterFlattenMtrl['fontSize'] = mtrl.fontSize;
  }
  if (lineHeight && lineHeight > 0) {
    mtrl.lineHeight = doNum(lineHeight * ratio);
    beforeFlattenMtrl['lineHeight'] = lineHeight;
    afterFlattenMtrl['lineHeight'] = mtrl.lineHeight;
  }

  const record: ModifyRecord<'modifyMaterial'> = {
    type: 'modifyMaterial',
    time: Date.now(),
    content: {
      method: 'modifyMaterial',
      id: mtrl.id,
      before: beforeFlattenMtrl,
      after: afterFlattenMtrl,
    },
  };

  return record;
}

function deepResizeMaterialByRatio(
  mtrl: StrictMaterial,
  opts: DeepResizeRatioOptions,
  record?: ModifyRecord<'resizeMaterials'>
) {
  const { type, id } = mtrl;

  // base and rect
  const rootRecord = resizeMaterialBaseByRatio(mtrl, opts);
  const rootRecordBefore: FlattenLayout & { id: string } = { ...rootRecord.content.before, id };
  const rootRecordAfter: FlattenLayout & { id: string } = { ...rootRecord.content.after, id };

  record?.content.before.push(rootRecordBefore);
  record?.content.after.push(rootRecordAfter);

  if (type === 'circle') {
    // TODO
  } else if (type === 'text') {
    const textRecord = resizeTextMaterialAttributesByRatio(mtrl as StrictMaterial<'text'>, opts);
    Object.keys(textRecord.content.before || {}).forEach((key) => {
      rootRecordBefore[key] = textRecord.content.before?.[key];
    });
    Object.keys(textRecord.content.after || {}).forEach((key) => {
      rootRecordAfter[key] = textRecord.content.after?.[key];
    });
  } else if (type === 'image') {
    // TODO
  } else if (type === 'svgCode') {
    // TODO
  } else if (type === 'foreignObject') {
    // TODO
  } else if (type === 'path') {
    // TODO
  } else if (type === 'group' && Array.isArray((mtrl as StrictMaterial<'group'>).children)) {
    (mtrl as StrictMaterial<'group'>).children.forEach((child) => {
      deepResizeMaterialByRatio(child, opts, record);
    });
  }
}

function fixedResizeGroupMaterialChildren(
  mtrl: StrictMaterial<'group'>,
  opts: FixedResizeOptions,
  record?: ModifyRecord<'resizeMaterials'>
) {
  if (!(mtrl.type === 'group' && Array.isArray(mtrl.children))) {
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

  mtrl.children.forEach((child) => {
    const { id, x, y } = child;
    const afterX = x + childChangedX;
    const afterY = y + childChangedY;
    const before: FlattenLayout & { id: string } = { id, x, y };
    const after: FlattenLayout & { id: string } = { id, x: afterX, y: afterY };
    child.x = afterX;
    child.y = afterY;
    record?.content.before.push(before);
    record?.content.after.push(after);
  });
}

export function resizeEffectGroupMaterial(
  mtrl: StrictMaterial<'group'>,
  size: Partial<MaterialSize>,
  opts?: {
    resizeEffect?: MaterialOperations['resizeEffect'];
  }
): ModifyRecord<'resizeMaterials'> | null {
  const record: ModifyRecord<'resizeMaterials'> = {
    type: 'resizeMaterials',
    time: Date.now(),
    content: {
      method: 'modifyMaterials',
      before: [],
      after: [],
    },
  };

  const id = mtrl.id;
  const originalX: number = mtrl.x;
  const originalY: number = mtrl.y;
  const originalW: number = mtrl.width;
  const originalH: number = mtrl.height;

  const resizeX: number = (istype.number(size.x) ? size.x : mtrl.x) as number;
  const resizeY: number = (istype.number(size.y) ? size.y : mtrl.y) as number;
  const resizeW: number = (size.width && size.width > 0 ? size.width : mtrl.width) || 0;
  const resizeH: number = (size.height && size.height > 0 ? size.height : mtrl.height) || 0;

  const beforeGroupMtrl: FlattenLayout & { id: string } = {
    id,
    x: originalX,
    y: originalY,
    width: originalW,
    height: originalH,
  };
  const afterGroupMtrl: FlattenLayout & { id: string } = {
    id,
    x: resizeX,
    y: resizeY,
    width: resizeW,
    height: resizeH,
  };

  if (opts?.resizeEffect === 'deepResize') {
    record.content.before.push(beforeGroupMtrl);
    record.content.after.push(afterGroupMtrl);
    const xRatio = resizeW / mtrl.width;
    const yRatio = resizeH / mtrl.height;
    if (xRatio === yRatio && xRatio === 1) {
      return record;
    }

    const minRatio = Math.min(xRatio, yRatio);
    const maxRatio = Math.max(xRatio, yRatio);

    mtrl.width = resizeW;
    mtrl.height = resizeH;
    const resizeRadioOpts = { xRatio, yRatio, minRatio, maxRatio };
    if (mtrl.type === 'group' && Array.isArray(mtrl.children)) {
      mtrl.children.forEach((child) => {
        deepResizeMaterialByRatio(child, resizeRadioOpts, record);
      });
    }
    const groupAttributesRecord = resizeMaterialBaseAttributesByRatio(mtrl, resizeRadioOpts);
    Object.keys(groupAttributesRecord.content.before || {}).forEach((key) => {
      beforeGroupMtrl[key] = groupAttributesRecord.content.before?.[key];
    });
    Object.keys(groupAttributesRecord.content.after || {}).forEach((key) => {
      afterGroupMtrl[key] = groupAttributesRecord.content.after?.[key];
    });

    return record;
  }

  // fixed
  if (opts?.resizeEffect === 'fixed') {
    record.content.before.push(beforeGroupMtrl);
    record.content.after.push(afterGroupMtrl);

    const moveX = resizeX - mtrl.x;
    const moveY = resizeY - mtrl.y;
    const moveW = resizeW - mtrl.width;
    const moveH = resizeH - mtrl.height;
    fixedResizeGroupMaterialChildren(mtrl, { moveX, moveY, moveH, moveW }, record);

    mtrl.width = resizeW;
    mtrl.height = resizeH;
    mtrl.x = resizeX;
    mtrl.y = resizeY;
    return record;
  }

  // default  'absolute'
  mtrl.width = resizeW;
  mtrl.height = resizeH;
  mtrl.x = resizeX;
  mtrl.y = resizeY;
  record.content.before.push(beforeGroupMtrl);
  record.content.after.push(afterGroupMtrl);

  return record;
}
