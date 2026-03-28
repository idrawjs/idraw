import type {
  RecursivePartial,
  StrictMaterial,
  MaterialPosition,
  MaterialSize,
  MaterialType,
  MaterialColor,
  LinearGradientColor,
  RadialGradientColor,
  ViewScaleInfo,
  ViewSizeInfo,
  Material,
} from '@idraw/types';
import { createUUID } from '../tool/uuid';
import {
  defaultText,
  getDefaultMaterialRectAttributes,
  getDefaultMaterialCircleAttributes,
  getDefaultMaterialTextAttributes,
  getDefaultMaterialSVGAttributes,
  getDefaultMaterialImageAttributes,
  getDefaultMaterialGroupAttributes,
} from './static';
import { toFlattenMaterial } from './modify-record';
import { set, del } from '../tool/get-set-del';
import { findMaterialFromListByPosition, getMaterialPositionFromList } from './material';
import { resizeEffectGroupMaterial } from './resize-material';

const defaultViewWidth = 200;
const defaultViewHeight = 200;
// const defaultAttributes = getDefaultMaterialAttributes();

function createMaterialSize(
  type: MaterialType,
  opts?: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): MaterialSize {
  let x = 0;
  let y = 0;
  let w = defaultViewWidth;
  let h = defaultViewHeight;

  if (opts) {
    const { viewScaleInfo, viewSizeInfo } = opts;
    const { scale, offsetLeft, offsetTop } = viewScaleInfo;
    const { width, height } = viewSizeInfo;
    const limitViewWidth = width / 4;
    const limitViewHeight = height / 4;
    if (defaultViewWidth >= limitViewWidth) {
      w = limitViewWidth / scale;
    } else {
      w = defaultViewWidth / scale;
    }

    if (defaultViewHeight >= limitViewHeight) {
      h = limitViewHeight / scale;
    } else {
      h = defaultViewHeight / scale;
    }
    if (['circle', 'svgCode', 'image'].includes(type)) {
      w = h = Math.max(w, h);
    } else if (type === 'text') {
      const fontSize = w / defaultText.length;
      h = fontSize * 2;
    }

    x = (0 - offsetLeft + width / 2 - (w * scale) / 2) / scale;
    y = (0 - offsetTop + height / 2 - (h * scale) / 2) / scale;
  }

  const mtrlSize: MaterialSize = {
    x,
    y,
    width: w,
    height: h,
  };

  return mtrlSize;
}

export function createMaterial<T extends MaterialType>(
  type: T,
  baseMtrl: RecursivePartial<StrictMaterial<T>>,
  opts?: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    limitRatio?: boolean;
  }
): StrictMaterial<T> {
  const materialSize = createMaterialSize(type, opts);
  let attributes = {};
  if (type === 'rect') {
    attributes = getDefaultMaterialRectAttributes();
  } else if (type === 'circle') {
    attributes = getDefaultMaterialCircleAttributes();
  } else if (type === 'text') {
    attributes = getDefaultMaterialTextAttributes(materialSize);
  } else if (type === 'svgCode') {
    attributes = getDefaultMaterialSVGAttributes();
  } else if (type === 'image') {
    attributes = getDefaultMaterialImageAttributes();
  } else if (type === 'group') {
    attributes = getDefaultMaterialGroupAttributes();
    const groupBase = baseMtrl as StrictMaterial<'group'>;
    if (Array.isArray(groupBase.children) && groupBase.children.length > 0) {
      (attributes as StrictMaterial<'group'>).children = [...groupBase.children];
    }
  }
  const mtrl: StrictMaterial<T> = {
    id: createUUID(),
    type,
    ...materialSize,
    ...attributes,
    ...baseMtrl,
  } as unknown as StrictMaterial<T>;
  return mtrl;
}

export function insertMaterialToListByPosition(
  material: StrictMaterial,
  position: MaterialPosition,
  list: StrictMaterial[]
): boolean {
  let result = false;
  if (position.length === 1) {
    const pos = position[0];
    list.splice(pos, 0, material);
    result = true;
  } else if (position.length > 1) {
    let tempList: StrictMaterial[] = list;
    for (let i = 0; i < position.length; i++) {
      const pos = position[i];
      const item = tempList[pos];
      if (i === position.length - 1) {
        const pos = position[i];
        tempList.splice(pos, 0, material);
        result = true;
      } else if (i < position.length - 1 && item.type === 'group') {
        tempList = (item as StrictMaterial<'group'>).children;
      } else {
        break;
      }
    }
  }
  return result;
}

export function deleteMaterialInListByPosition(position: MaterialPosition, list: StrictMaterial[]): boolean {
  let result = false;
  if (position.length === 1) {
    const pos = position[0];
    list.splice(pos, 1);
    result = true;
  } else if (position.length > 1) {
    let tempList: StrictMaterial[] = list;
    for (let i = 0; i < position.length; i++) {
      const pos = position[i];
      const item = tempList[pos];
      if (i === position.length - 1) {
        const pos = position[i];
        tempList.splice(pos, 1);
        result = true;
      } else if (i < position.length - 1 && item.type === 'group') {
        tempList = (item as StrictMaterial<'group'>).children;
      } else {
        break;
      }
    }
  }
  return result;
}

export function deleteMaterialInList(id: string, list: StrictMaterial[]): boolean {
  const position = getMaterialPositionFromList(id, list);
  return deleteMaterialInListByPosition(position, list);
}

export function moveMaterialPosition(
  materials: StrictMaterial[],
  opts: {
    from: MaterialPosition;
    to: MaterialPosition;
  }
): { materials: StrictMaterial[]; from: MaterialPosition; to: MaterialPosition } {
  // const { from, to } = opts;
  const from = [...opts.from];
  const to = [...opts.to];

  // [] -> [1,2,3] or [1, 2 ,3] -> []
  if (from.length === 0 || to.length === 0) {
    return { materials, from, to };
  }

  // invalid [1] -> [1, 2, 3]
  if (from.length <= to.length) {
    for (let i = 0; i < from.length; i++) {
      if (to[i] === from[i]) {
        if (i === from.length - 1) {
          return { materials, from, to };
        }
        continue;
      }
    }
  }

  const target = findMaterialFromListByPosition(from, materials);

  if (target) {
    const insterResult = insertMaterialToListByPosition(target, to, materials);
    if (!insterResult) {
      return { materials, from, to };
    }

    let trimDeletePosIndex = -1;
    const trimDeletePosAction = 'down'; // +1

    let isEffectToIndex = false;

    if (from.length >= 1 && to.length >= 1) {
      // isEffectToIndex
      // false [2, 4] -> [1, 2]
      // false [3, 4, 5] -> [4, 5]

      // up -> down
      // true  [2] -> [4]
      // true  [2] -> [3, 4]
      // true  [2, 3] -> [2, 3, 4]
      if (from.length <= to.length) {
        if (from.length === 1) {
          if (from[0] < to[0]) {
            isEffectToIndex = true;
          }
        } else {
          for (let i = 0; i < from.length; i++) {
            if (from[i] === to[i]) {
              if (from.length === from.length - 1) {
                isEffectToIndex = true;
                break;
              }
            } else {
              break;
            }
          }
        }
      }

      // down -> up
      // true  [4] -> [2]
      // true  [3, 4, 5] -> [3, 3]
      // true  [3, 4, 5] -> [2]
      if (from.length >= to.length) {
        if (to.length === 1) {
          if (to[0] < from[0]) {
            isEffectToIndex = true;
          }
        } else {
          for (let i = 0; i < to.length; i++) {
            if (i === to.length - 1 && to[i] < from[i]) {
              isEffectToIndex = true;
            }
            if (from[i] === to[i]) {
              continue;
            } else {
              break;
            }
          }
        }
      }
    }

    if (isEffectToIndex === true) {
      for (let i = 0; i < from.length; i++) {
        if (!(to[i] >= 0)) {
          break;
        }
        if (to[i] === from[i]) {
          continue;
        }

        if (to[i] < from[i] && i == to.length - 1) {
          trimDeletePosIndex = i;
        }
      }
    }

    if (trimDeletePosIndex >= 0) {
      if (trimDeletePosAction === 'down') {
        from[trimDeletePosIndex] = from[trimDeletePosIndex] + 1;
      }
    }

    deleteMaterialInListByPosition(from, materials);
  }
  return { materials, from, to };
}

function clearMaterialColor(color: MaterialColor): MaterialColor {
  if (Array.isArray((color as LinearGradientColor | RadialGradientColor)?.stops)) {
    const emptyIndexes: number[] = [];
    const stops = (color as LinearGradientColor | RadialGradientColor)?.stops;
    for (let i = stops.length - 1; i >= 0; i--) {
      const stop = stops[i];
      if (!(stop.color && stop.offset >= 0)) {
        emptyIndexes.push(i);
      }
    }
    emptyIndexes.forEach((idx: number) => {
      stops.splice(idx, 1);
    });
  }
  return color;
}

export function mergeMaterial<T extends StrictMaterial<MaterialType> = StrictMaterial<MaterialType>>(
  originMtrl: T,
  updateContent: RecursivePartial<T>,
  opts?: {
    onlyUpdateContent?: boolean;
  }
): T {
  const updatedFlatten = toFlattenMaterial(updateContent as RecursivePartial<Material>);
  const ignoreKeys = ['id', 'type'];

  const updatedFlattenKeys = Object.keys(updatedFlatten);

  updatedFlattenKeys.forEach((key) => {
    if (!ignoreKeys.includes(key)) {
      const value = updatedFlatten[key];
      del(originMtrl, key);
      if (value !== undefined) {
        set(originMtrl, key, value);
      }
    }
  });

  if (opts?.onlyUpdateContent === true) {
    const originFlatten = toFlattenMaterial(originMtrl);
    const originFlattenKeys = Object.keys(originFlatten);
    originFlattenKeys.forEach((key) => {
      if (!ignoreKeys.includes(key)) {
        if (!updatedFlattenKeys.includes(key)) {
          del(originMtrl, key);
        }
      }
    });
  }

  if (originMtrl.fill) {
    originMtrl.fill = clearMaterialColor(originMtrl.fill);
  }

  return originMtrl;
}

export function updateMaterialInList(
  id: string,
  updateContent: RecursivePartial<StrictMaterial<MaterialType>>,
  materials: StrictMaterial[]
): StrictMaterial | null {
  let targetMaterial: StrictMaterial | null = null;
  for (let i = 0; i < materials.length; i++) {
    const mtrl = materials[i];
    if (mtrl.id === id) {
      if (mtrl.type === 'group' && mtrl.operations?.resizeEffect) {
        resizeEffectGroupMaterial(
          mtrl as StrictMaterial<'group'>,
          {
            ...updateContent,
          },
          {
            resizeEffect: mtrl.operations?.resizeEffect,
          }
        );
      }

      mergeMaterial(mtrl, updateContent);
      targetMaterial = mtrl;
      break;
    } else if (mtrl.type === 'group') {
      targetMaterial = updateMaterialInList(id, updateContent, (mtrl as StrictMaterial<'group'>)?.children || []);
    }
  }
  return targetMaterial;
}

export function updateMaterialInListByPosition(
  position: MaterialPosition,
  updateContent: RecursivePartial<StrictMaterial<MaterialType>>,
  materials: StrictMaterial[],
  opts?: { onlyUpdateContent?: boolean }
): StrictMaterial | null {
  const mtrl: StrictMaterial | null = findMaterialFromListByPosition(position, materials);
  if (mtrl) {
    if (mtrl.type === 'group' && mtrl.operations?.resizeEffect) {
      resizeEffectGroupMaterial(
        mtrl as StrictMaterial<'group'>,
        {
          ...updateContent,
        },
        {
          resizeEffect: mtrl.operations?.resizeEffect,
        }
      );
    }
    mergeMaterial(mtrl, updateContent, opts);
  }
  return mtrl;
}
