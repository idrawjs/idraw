import type { Data, MaterialAssets, MaterialType, StrictMaterial, LoadItemMap } from '@idraw/types';
import { createAssetId, createUUID, isAssetId } from '../tool/uuid';

export function deepClone<T = any>(target: T): T {
  function _clone(t: T) {
    const type = is(t);
    if (['Null', 'Number', 'String', 'Boolean', 'Undefined'].indexOf(type) >= 0) {
      return t;
    } else if (type === 'Array') {
      const arr: any[] = [];
      (t as any[]).forEach((item: any) => {
        arr.push(_clone(item));
      });
      return arr;
    } else if (type === 'Object') {
      const obj: { [key: string | symbol]: any } = {};
      const keys = Object.keys(t as any);
      keys.forEach((key) => {
        obj[key] = _clone((t as Record<string, any>)[key]);
      });
      const symbolKeys = Object.getOwnPropertySymbols(t);
      symbolKeys.forEach((key) => {
        obj[key] = _clone((t as Record<symbol, any>)[key]);
      });
      return obj;
    }
  }
  return _clone(target) as T;
}

export function deepCloneMaterial<T extends StrictMaterial = StrictMaterial>(material: T): T {
  const mtrl = deepClone(material);
  const _resetUUID = (e: StrictMaterial) => {
    e.id = createUUID();
    if (e.type === 'group' && (e as StrictMaterial<'group'>).children) {
      (e as StrictMaterial<'group'>).children.forEach((child) => {
        _resetUUID(child);
      });
    }
  };
  _resetUUID(mtrl);
  return mtrl;
}

export function deepCloneData(data: Data): Data {
  const { materials, ...restData } = data;
  return {
    ...deepClone(restData),
    ...{
      materials: materials.map((mtrl) => deepCloneMaterial(mtrl)),
    },
  };
}

function is(target: any): string {
  return (
    Object.prototype.toString
      .call(target)
      // eslint-disable-next-line no-useless-escape
      .replace(/[\]|\[]{1,1}/gi, '')
      .split(' ')[1]
  );
}

export function sortDataAsserts(data: Data, opts?: { clone?: boolean }): Data {
  const assets: MaterialAssets = data.assets || {};
  let sortedData = data;
  if (opts?.clone === true) {
    sortedData = deepClone(data);
  }
  const _scanMaterials = (mtrls: StrictMaterial[]) => {
    mtrls.forEach((mtrl: StrictMaterial<MaterialType>) => {
      if (mtrl.type === 'image' && (mtrl as StrictMaterial<'image'>).href) {
        const href = (mtrl as StrictMaterial<'image'>).href;
        const assetUUID = createAssetId(href, mtrl.id);
        if (!assets[assetUUID]) {
          assets[assetUUID] = {
            type: 'image',
            value: href,
          };
        }
        (mtrl as StrictMaterial<'image'>).href = assetUUID;
      } else if (mtrl.type === 'svgCode') {
        const svg = (mtrl as StrictMaterial<'svgCode'>).code;
        const assetUUID = createAssetId(svg, mtrl.id);
        if (!assets[assetUUID]) {
          assets[assetUUID] = {
            type: 'svgCode',
            value: svg,
          };
        }
        (mtrl as StrictMaterial<'svgCode'>).code = assetUUID;
      } else if (mtrl.type === 'foreignObject') {
        const html = (mtrl as StrictMaterial<'foreignObject'>).content;
        const assetUUID = createAssetId(html, mtrl.id);
        if (!assets[assetUUID]) {
          assets[assetUUID] = {
            type: 'foreignObject',
            value: html,
          };
        }
        (mtrl as StrictMaterial<'foreignObject'>).content = assetUUID;
      } else if (mtrl.type === 'group' && Array.isArray((mtrl as StrictMaterial<'group'>).children)) {
        const groupAssets = (mtrl as StrictMaterial<'group'>).assets || {};
        Object.keys(groupAssets).forEach((assetId) => {
          if (!assets[assetId]) {
            assets[assetId] = groupAssets[assetId];
          }
        });
        delete (mtrl as StrictMaterial<'group'>).assets;
        _scanMaterials((mtrl as StrictMaterial<'group'>).children);
      }
    });
  };

  _scanMaterials(sortedData.materials);
  sortedData.assets = assets;
  return sortedData;
}

export function filterCompactData(data: Data, opts?: { loadItemMap?: LoadItemMap }) {
  const assets: MaterialAssets = data.assets || {};
  const sortedData = deepClone(data);
  const loadItemMap = opts?.loadItemMap || {};

  const _scanMaterials = (mtrls: StrictMaterial[]) => {
    mtrls.forEach((mtrl: StrictMaterial<MaterialType>) => {
      if (mtrl.type === 'image' && (mtrl as StrictMaterial<'image'>).href) {
        const href = (mtrl as StrictMaterial<'image'>).href;
        if (isAssetId(href) && !assets[href] && loadItemMap[href] && typeof loadItemMap[href]?.source === 'string') {
          assets[href] = {
            type: 'image',
            value: loadItemMap[href].source as string,
          };
        } else if (!assets[href]) {
          const assetUUID = createAssetId(href, mtrl.id);
          if (!assets[assetUUID]) {
            assets[assetUUID] = {
              type: 'image',
              value: href,
            };
          }
          (mtrl as StrictMaterial<'image'>).href = assetUUID;
        }
      } else if (mtrl.type === 'svgCode') {
        const svg = (mtrl as StrictMaterial<'svgCode'>).code;

        if (isAssetId(svg) && !assets[svg] && loadItemMap[svg] && typeof loadItemMap[svg]?.source === 'string') {
          assets[svg] = {
            type: 'svgCode',
            value: loadItemMap[svg].source as string,
          };
        } else if (!assets[svg]) {
          const assetUUID = createAssetId(svg, mtrl.id);
          if (!assets[assetUUID]) {
            assets[assetUUID] = {
              type: 'svgCode',
              value: svg,
            };
          }
          (mtrl as StrictMaterial<'svgCode'>).code = assetUUID;
        }
      } else if (mtrl.type === 'foreignObject') {
        const html = (mtrl as StrictMaterial<'foreignObject'>).content;

        if (isAssetId(html) && !assets[html] && loadItemMap[html] && typeof loadItemMap[html]?.source === 'string') {
          assets[html] = {
            type: 'foreignObject',
            value: loadItemMap[html].source as string,
          };
        } else if (!assets[html]) {
          const assetUUID = createAssetId(html, mtrl.id);
          if (!assets[assetUUID]) {
            assets[assetUUID] = {
              type: 'foreignObject',
              value: html,
            };
          }
          (mtrl as StrictMaterial<'foreignObject'>).content = assetUUID;
        }
      } else if (mtrl.type === 'group' && Array.isArray((mtrl as StrictMaterial<'group'>).children)) {
        const groupAssets = (mtrl as StrictMaterial<'group'>).assets || {};
        Object.keys(groupAssets).forEach((assetId) => {
          if (!assets[assetId]) {
            assets[assetId] = groupAssets[assetId];
          }
        });
        delete (mtrl as StrictMaterial<'group'>).assets;
        _scanMaterials((mtrl as StrictMaterial<'group'>).children);
      }
    });
  };

  _scanMaterials(sortedData.materials);
  sortedData.assets = assets;
  return sortedData;
}
