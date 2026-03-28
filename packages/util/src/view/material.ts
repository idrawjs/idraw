import type {
  Data,
  Material,
  StrictMaterial,
  MaterialType,
  MaterialSize,
  ViewContextSize,
  ViewSizeInfo,
  MaterialAssets,
  MaterialAssetsItem,
  LoadMaterialType,
  MaterialPosition,
} from '@idraw/types';
import { limitAngle, rotateMaterialVertexes } from './rotate';
import { isAssetId, createAssetId } from '../tool/uuid';

function getGroupUUIDs(materials: Array<StrictMaterial<MaterialType>>, index: string): string[] {
  const ids: string[] = [];
  if (typeof index === 'string' && /^\d+(\.\d+)*$/.test(index)) {
    const nums = index.split('.');
    let target: Array<StrictMaterial<MaterialType>> = materials;
    while (nums.length > 0) {
      const num = nums.shift();
      if (typeof num === 'string') {
        const mtrl = target[parseInt(num)];
        if (mtrl && nums.length === 0) {
          ids.push(mtrl.id);
        } else if (mtrl.type === 'group' && nums.length > 0) {
          target = (mtrl as StrictMaterial<'group'>)?.children || [];
        }
      }
      break;
    }
  }
  return ids;
}

export function getSelectedMaterialUUIDs(data: Data, indexes: Array<number | string>): string[] {
  let ids: string[] = [];
  if (Array.isArray(data?.materials) && data?.materials?.length > 0 && Array.isArray(indexes) && indexes.length > 0) {
    indexes.forEach((idx: number | string) => {
      if (typeof idx === 'number') {
        if (data?.materials?.[idx]) {
          ids.push(data.materials[idx].id);
        }
      } else if (typeof idx === 'string') {
        ids = ids.concat(getGroupUUIDs(data.materials, idx));
      }
    });
  }
  return ids;
}

export function validateMaterials(materials: Array<StrictMaterial<MaterialType>>): boolean {
  let isValid = true;
  if (Array.isArray(materials)) {
    const ids: string[] = [];
    materials.forEach((mtrl) => {
      if (typeof mtrl.id === 'string' && mtrl.id) {
        if (ids.includes(mtrl.id)) {
          isValid = false;
          // eslint-disable-next-line no-console
          console.warn(`Duplicate ids: ${mtrl.id}`);
        } else {
          ids.push(mtrl.id);
        }
      } else {
        isValid = false;
        // eslint-disable-next-line no-console
        console.warn('Material missing id', mtrl);
      }
      if (mtrl.type === 'group') {
        isValid = validateMaterials((mtrl as StrictMaterial<'group'>)?.children);
      }
    });
  }
  return isValid;
}

type AreaSize = MaterialSize;

export function calcMaterialListSize(list: StrictMaterial[]): MaterialSize {
  const area: AreaSize = { x: 0, y: 0, width: 0, height: 0 };
  let prevMtrlSize: MaterialSize | null = null;

  for (let i = 0; i < list.length; i++) {
    const mtrl = list[i];
    if (mtrl?.operations?.invisible) {
      continue;
    }
    const mtrlSize: MaterialSize = {
      x: mtrl.x,
      y: mtrl.y,
      width: mtrl.width,
      height: mtrl.height,
      angle: mtrl.angle || 0,
    };

    if (mtrlSize.angle && (mtrlSize.angle > 0 || mtrlSize.angle < 0)) {
      const ves = rotateMaterialVertexes(mtrlSize);
      if (ves.length === 4) {
        const xList = [ves[0].x, ves[1].x, ves[2].x, ves[3].x];
        const yList = [ves[0].y, ves[1].y, ves[2].y, ves[3].y];
        mtrlSize.x = Math.min(...xList);
        mtrlSize.y = Math.min(...yList);
        mtrlSize.width = Math.abs(Math.max(...xList) - Math.min(...xList));
        mtrlSize.height = Math.abs(Math.max(...yList) - Math.min(...yList));
      }
    }
    if (prevMtrlSize) {
      const areaStartX = Math.min(mtrlSize.x, area.x);
      const areaStartY = Math.min(mtrlSize.y, area.y);

      const areaEndX = Math.max(mtrlSize.x + mtrlSize.width, area.x + area.width);
      const areaEndY = Math.max(mtrlSize.y + mtrlSize.height, area.y + area.height);

      area.x = areaStartX;
      area.y = areaStartY;
      area.width = Math.abs(areaEndX - areaStartX);
      area.height = Math.abs(areaEndY - areaStartY);
    } else {
      area.x = mtrlSize.x;
      area.y = mtrlSize.y;
      area.width = mtrlSize.width;
      area.height = mtrlSize.height;
    }
    prevMtrlSize = mtrlSize;
  }

  const listSize: MaterialSize = {
    x: Math.floor(area.x),
    y: Math.floor(area.y),
    width: Math.ceil(area.width),
    height: Math.ceil(area.height),
  };

  return listSize;
}

export function calcMaterialsContextSize(
  materials: Array<StrictMaterial<MaterialType>>,
  opts?: { viewWidth: number; viewHeight: number; extend?: boolean }
): ViewContextSize {
  const area: AreaSize = { x: 0, y: 0, width: 0, height: 0 };
  materials.forEach((mtrl: StrictMaterial<MaterialType>) => {
    const mtrlSize: MaterialSize = {
      x: mtrl.x,
      y: mtrl.y,
      width: mtrl.width,
      height: mtrl.height,
      angle: mtrl.angle,
    };
    if (mtrlSize.angle && (mtrlSize.angle > 0 || mtrlSize.angle < 0)) {
      const ves = rotateMaterialVertexes(mtrlSize);
      if (ves.length === 4) {
        const xList = [ves[0].x, ves[1].x, ves[2].x, ves[3].x];
        const yList = [ves[0].y, ves[1].y, ves[2].y, ves[3].y];
        mtrlSize.x = Math.min(...xList);
        mtrlSize.y = Math.min(...yList);
        mtrlSize.width = Math.abs(Math.max(...xList) - Math.min(...xList));
        mtrlSize.height = Math.abs(Math.max(...yList) - Math.min(...yList));
      }
    }
    const areaStartX = Math.min(mtrlSize.x, area.x);
    const areaStartY = Math.min(mtrlSize.y, area.y);

    const areaEndX = Math.max(mtrlSize.x + mtrlSize.width, area.x + area.width);
    const areaEndY = Math.max(mtrlSize.y + mtrlSize.height, area.y + area.height);

    area.x = areaStartX;
    area.y = areaStartY;
    area.width = Math.abs(areaEndX - areaStartX);
    area.height = Math.abs(areaEndY - areaStartY);
  });

  if (opts?.extend) {
    area.x = Math.min(area.x, 0);
    area.y = Math.min(area.y, 0);
  }

  const ctxSize = {
    contextWidth: area.width,
    contextHeight: area.height,
  };

  if (opts?.viewWidth && opts?.viewHeight && opts?.viewWidth > 0 && opts?.viewHeight > 0) {
    if (opts.viewWidth > area.x + area.width) {
      ctxSize.contextWidth = opts.viewWidth - area.x;
    }
    if (opts.viewHeight > area.y + area.height) {
      ctxSize.contextHeight = opts.viewHeight - area.y;
    }
  }
  return ctxSize;
}

export function calcMaterialsViewInfo(
  materials: Array<StrictMaterial<MaterialType>>,
  prevViewSize: ViewSizeInfo,
  options?: {
    extend: boolean;
  }
): {
  contextSize: ViewContextSize;
} {
  const contextSize = calcMaterialsContextSize(materials, {
    viewWidth: prevViewSize.width,
    viewHeight: prevViewSize.height,
    extend: options?.extend,
  });
  if (options?.extend === true) {
    contextSize.contextWidth = Math.max(contextSize.contextWidth, prevViewSize.contextWidth);
    contextSize.contextHeight = Math.max(contextSize.contextHeight, prevViewSize.contextHeight);
  }
  return {
    contextSize,
  };
}

export function getMaterialsAssetIds(materials: StrictMaterial[]): string[] {
  const assetIds: string[] = [];
  const _scanMaterials = (mtrls: StrictMaterial[]) => {
    mtrls.forEach((mtrl: StrictMaterial<MaterialType>) => {
      if (mtrl.type === 'image' && isAssetId((mtrl as StrictMaterial<'image'>).href)) {
        assetIds.push((mtrl as StrictMaterial<'image'>).href);
      } else if (mtrl.type === 'svgCode' && isAssetId((mtrl as StrictMaterial<'svgCode'>).code)) {
        assetIds.push((mtrl as StrictMaterial<'svgCode'>).code);
      } else if (mtrl.type === 'foreignObject' && (mtrl as StrictMaterial<'foreignObject'>).content) {
        assetIds.push((mtrl as StrictMaterial<'foreignObject'>).content);
      } else if (mtrl.type === 'group' && Array.isArray((mtrl as StrictMaterial<'group'>).children)) {
        _scanMaterials((mtrl as StrictMaterial<'group'>).children);
      }
    });
  };
  _scanMaterials(materials);
  return assetIds;
}

export function findMaterialFromList(
  id: string,
  list: StrictMaterial<MaterialType>[]
): StrictMaterial<MaterialType> | null {
  let result: StrictMaterial<MaterialType> | null = null;
  for (let i = 0; i < list.length; i++) {
    const mtrl = list[i];
    if (mtrl.id === id) {
      result = mtrl;
      break;
    } else if (!result && mtrl.type === 'group') {
      const resultInGroup = findMaterialFromList(id, (mtrl as StrictMaterial<'group'>)?.children || []);
      if (resultInGroup?.id === id) {
        result = resultInGroup;
        break;
      }
    }
  }
  return result;
}

export function findMaterialsFromList(
  ids: string[],
  list: StrictMaterial<MaterialType>[]
): StrictMaterial<MaterialType>[] {
  const result: StrictMaterial<MaterialType>[] = [];

  function _find(materials: StrictMaterial<MaterialType>[]) {
    for (let i = 0; i < materials.length; i++) {
      const mtrl = materials[i];
      if (ids.includes(mtrl.id)) {
        result.push(mtrl);
      } else if (mtrl.type === 'group') {
        _find((mtrl as StrictMaterial<'group'>)?.children || []);
      }
    }
  }
  _find(list);
  return result;
}

export function getMaterialAndGroupQueueFromList(
  id: string,
  materials: StrictMaterial<MaterialType>[]
): {
  groupQueue: StrictMaterial<'group'>[];
  material: Material | null;
  position: MaterialPosition;
} {
  const groupQueue: StrictMaterial<'group'>[] = [];
  let target: Material | null = null;
  const position: MaterialPosition = [];

  function _scan(id: string, materials: StrictMaterial<MaterialType>[]): StrictMaterial<MaterialType> | null {
    let result: StrictMaterial<MaterialType> | null = null;
    for (let i = 0; i < materials.length; i++) {
      const mtrl = materials[i];
      position.push(i);
      if (mtrl.id === id) {
        result = mtrl;
        target = mtrl;
        break;
      } else if (!result && mtrl.type === 'group') {
        groupQueue.push(mtrl as StrictMaterial<'group'>);
        const resultInGroup = _scan(id, (mtrl as StrictMaterial<'group'>)?.children || []);
        if (resultInGroup?.id === id) {
          result = resultInGroup;
          break;
        }
        groupQueue.pop();
        position.pop();
      }
    }
    return result;
  }
  _scan(id, materials);
  return {
    groupQueue,
    material: target,
    position,
  };
}

export function getGroupQueueFromList(
  id: string,
  materials: StrictMaterial<MaterialType>[]
): StrictMaterial<'group'>[] {
  const { groupQueue } = getMaterialAndGroupQueueFromList(id, materials);
  return groupQueue;
}

export function getGroupQueueByMaterialPosition(
  materials: StrictMaterial<MaterialType>[],
  position: MaterialPosition
): StrictMaterial<'group'>[] | null {
  const groupQueue: StrictMaterial<'group'>[] = [];
  let currentMaterials: StrictMaterial[] = materials;
  if (position.length > 1) {
    for (let i = 0; i < position.length - 1; i++) {
      const index = position[i];
      const group = currentMaterials[index] as StrictMaterial<'group'>;
      if (group?.type === 'group' && Array.isArray(group?.children)) {
        groupQueue.push(group);
        currentMaterials = group.children;
      } else {
        return null;
      }
    }
  }
  return groupQueue;
}

export function getMaterialSize(mtrl: StrictMaterial): MaterialSize {
  const { id, x, y, width, height, angle = 0 } = mtrl;
  const size: MaterialSize = { id, x, y, width, height, angle };
  return size;
}

export function mergeMaterialAsset<T extends StrictMaterial<LoadMaterialType>>(material: T, assets: MaterialAssets): T {
  // const mtrl: T = { ...material, ...{ attributes: { ...material.attributes } } };
  const mtrl = material;
  let assetId: string | null = null;
  let assetItem: MaterialAssetsItem | null = null;
  if (mtrl.type === 'image') {
    assetId = (mtrl as StrictMaterial<'image'>).href;
  } else if (mtrl.type === 'svgCode') {
    assetId = (mtrl as StrictMaterial<'svgCode'>).code;
  } else if (mtrl.type === 'foreignObject') {
    assetId = (mtrl as StrictMaterial<'foreignObject'>).content;
  }

  if (assetId && assetId?.startsWith('@assets/')) {
    assetItem = assets[assetId];
  }

  if (assetItem?.type === mtrl.type && typeof assetItem?.value === 'string' && assetItem?.value) {
    if (mtrl.type === 'image') {
      (mtrl as StrictMaterial<'image'>).href = assetItem.value;
    } else if (mtrl.type === 'svgCode') {
      (mtrl as StrictMaterial<'svgCode'>).code = assetItem.value;
    } else if (mtrl.type === 'foreignObject') {
      (mtrl as StrictMaterial<'foreignObject'>).content = assetItem.value;
    }
  }
  return mtrl;
}

export function filterMaterialAsset<T extends StrictMaterial<LoadMaterialType>>(
  material: T
): {
  material: T;
  assetId: string | null;
  assetItem: MaterialAssetsItem | null;
} {
  let assetId: string | null = null;
  let assetItem: MaterialAssetsItem | null = null;
  let resource: string | null = null;

  if (material.type === 'image') {
    resource = (material as StrictMaterial<'image'>).href;
  } else if (material.type === 'svgCode') {
    resource = (material as StrictMaterial<'svgCode'>).code;
  } else if (material.type === 'foreignObject') {
    resource = (material as StrictMaterial<'foreignObject'>).content;
  }

  if (typeof resource === 'string' && !isAssetId(resource)) {
    assetId = createAssetId(resource, material.id);
    assetItem = {
      type: material.type as LoadMaterialType,
      value: resource,
    };
    if (material.type === 'image') {
      (material as StrictMaterial<'image'>).href = assetId;
    } else if (material.type === 'svgCode') {
      (material as StrictMaterial<'svgCode'>).code = assetId;
    } else if (material.type === 'foreignObject') {
      (material as StrictMaterial<'foreignObject'>).content = assetId;
    }
  }

  return {
    material,
    assetId,
    assetItem,
  };
}

export function isResourceMaterial(mtrl: StrictMaterial): boolean {
  return ['image', 'svgCode', 'foreignObject'].includes(mtrl?.type);
}

export function findMaterialsFromListByPositions(
  positions: MaterialPosition[],
  list: StrictMaterial[]
): StrictMaterial[] {
  const materials: StrictMaterial[] = [];
  positions.forEach((pos: MaterialPosition) => {
    const mtrl = findMaterialFromListByPosition(pos, list);
    if (mtrl) {
      materials.push(mtrl);
    }
  });
  return materials;
}

export function findMaterialFromListByPosition(
  position: MaterialPosition,
  list: StrictMaterial[]
): StrictMaterial | null {
  let result: StrictMaterial | null = null;
  let tempList: StrictMaterial[] = list;
  for (let i = 0; i < position.length; i++) {
    const pos = position[i];
    const item = tempList[pos];
    if (i < position.length - 1 && item?.type === 'group') {
      tempList = (item as StrictMaterial<'group'>).children;
    } else if (i === position.length - 1) {
      result = item;
    } else {
      break;
    }
  }
  return result;
}

export function findMaterialQueueFromListByPosition(
  position: MaterialPosition,
  list: StrictMaterial[]
): StrictMaterial[] {
  const result: StrictMaterial[] = [];
  let tempList: StrictMaterial[] = list;
  for (let i = 0; i < position.length; i++) {
    const pos = position[i];
    const item = tempList[pos];
    if (item) {
      result.push(item);
    } else {
      break;
    }

    if (i < position.length - 1 && item.type === 'group') {
      tempList = (item as StrictMaterial<'group'>).children;
    } else {
      break;
    }
  }
  return result;
}

export function getMaterialPositionFromList(id: string, materials: StrictMaterial<MaterialType>[]): MaterialPosition {
  const result: MaterialPosition = [];
  let over = false;
  const _loop = (list: StrictMaterial<MaterialType>[]) => {
    for (let i = 0; i < list.length; i++) {
      if (over === true) {
        break;
      }
      result.push(i);
      const mtrl = list[i];
      if (mtrl.id === id) {
        over = true;
        break;
      } else if (mtrl.type === 'group') {
        _loop((mtrl as StrictMaterial<'group'>)?.children || []);
      }
      if (over) {
        break;
      }
      result.pop();
    }
  };
  _loop(materials);
  return result;
}

export function getMaterialPositionMapFromList(
  ids: string[],
  materials: StrictMaterial<MaterialType>[]
): {
  [id: string]: MaterialPosition;
} {
  const currentPosition: MaterialPosition = [];
  const positionMap: {
    [id: string]: MaterialPosition;
  } = {};

  let over = false;
  const _loop = (list: StrictMaterial<MaterialType>[]) => {
    for (let i = 0; i < list.length; i++) {
      if (over === true) {
        break;
      }
      currentPosition.push(i);
      const mtrl = list[i];
      if (ids.includes(mtrl.id)) {
        positionMap[mtrl.id] = [...currentPosition];

        if (Object.keys(positionMap).length === ids.length) {
          over = true;
          break;
        }
      } else if (mtrl.type === 'group') {
        _loop((mtrl as StrictMaterial<'group'>)?.children || []);
      }
      if (over) {
        break;
      }
      currentPosition.pop();
    }
  };
  _loop(materials);
  return positionMap;
}

export function isSameMaterialSize(mtrl1: MaterialSize, mtrl2: MaterialSize) {
  return (
    mtrl1.x === mtrl2.x &&
    mtrl1.y === mtrl2.y &&
    mtrl1.height === mtrl2.height &&
    mtrl1.width === mtrl2.width &&
    limitAngle(mtrl1.angle || 0) === limitAngle(mtrl2.angle || 0)
  );
}
