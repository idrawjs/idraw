import type { Data, ElementAssets, Elements, ElementType, Element, LoadItemMap } from '@idraw/types';
import { createAssetId, createUUID, isAssetId } from './uuid';

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

export function deepCloneElement<T extends Element = Element>(element: T): T {
  const elem = deepClone(element);
  const _resetUUID = (e: Element) => {
    e.uuid = createUUID();
    if (e.type === 'group' && (e as Element<'group'>).detail.children) {
      (e as Element<'group'>).detail.children.forEach((child) => {
        _resetUUID(child);
      });
    }
  };
  _resetUUID(elem);
  return elem;
}

function is(target: any): string {
  return Object.prototype.toString
    .call(target)
    .replace(/[\]|\[]{1,1}/gi, '')
    .split(' ')[1];
}

export function sortDataAsserts(data: Data, opts?: { clone?: boolean }): Data {
  const assets: ElementAssets = data.assets || {};
  let sortedData = data;
  if (opts?.clone === true) {
    sortedData = deepClone(data);
  }
  const _scanElements = (elems: Elements) => {
    elems.forEach((elem: Element<ElementType>) => {
      if (elem.type === 'image' && (elem as Element<'image'>).detail.src) {
        const src = (elem as Element<'image'>).detail.src;
        const assetUUID = createAssetId(src);
        if (!assets[assetUUID]) {
          assets[assetUUID] = {
            type: 'image',
            value: src
          };
        }
        (elem as Element<'image'>).detail.src = assetUUID;
      } else if (elem.type === 'svg') {
        const svg = (elem as Element<'svg'>).detail.svg;
        const assetUUID = createAssetId(svg);
        if (!assets[assetUUID]) {
          assets[assetUUID] = {
            type: 'svg',
            value: svg
          };
        }
        (elem as Element<'svg'>).detail.svg = assetUUID;
      } else if (elem.type === 'html') {
        const html = (elem as Element<'html'>).detail.html;
        const assetUUID = createAssetId(html);
        if (!assets[assetUUID]) {
          assets[assetUUID] = {
            type: 'html',
            value: html
          };
        }
        (elem as Element<'html'>).detail.html = assetUUID;
      } else if (elem.type === 'group' && Array.isArray((elem as Element<'group'>).detail.children)) {
        const groupAssets = (elem as Element<'group'>).detail.assets || {};
        Object.keys(groupAssets).forEach((assetId) => {
          if (!assets[assetId]) {
            assets[assetId] = groupAssets[assetId];
          }
        });
        delete (elem as Element<'group'>).detail.assets;
        _scanElements((elem as Element<'group'>).detail.children);
      }
    });
  };

  _scanElements(sortedData.elements);
  sortedData.assets = assets;
  return sortedData;
}

export function filterCompactData(data: Data, opts?: { loadItemMap?: LoadItemMap }) {
  const assets: ElementAssets = data.assets || {};
  const sortedData = deepClone(data);
  const loadItemMap = opts?.loadItemMap || {};

  const _scanElements = (elems: Elements) => {
    elems.forEach((elem: Element<ElementType>) => {
      if (elem.type === 'image' && (elem as Element<'image'>).detail.src) {
        const src = (elem as Element<'image'>).detail.src;
        if (isAssetId(src) && !assets[src] && loadItemMap[src] && typeof loadItemMap[src]?.source === 'string') {
          assets[src] = {
            type: 'image',
            value: loadItemMap[src].source as string
          };
        } else {
          const assetUUID = createAssetId(src);
          if (!assets[assetUUID]) {
            assets[assetUUID] = {
              type: 'image',
              value: src
            };
          }
          (elem as Element<'image'>).detail.src = assetUUID;
        }
      } else if (elem.type === 'svg') {
        const svg = (elem as Element<'svg'>).detail.svg;
        const assetUUID = createAssetId(svg);
        if (isAssetId(svg) && !assets[svg] && loadItemMap[svg] && typeof loadItemMap[svg]?.source === 'string') {
          assets[svg] = {
            type: 'svg',
            value: loadItemMap[svg].source as string
          };
        } else if (!assets[assetUUID]) {
          assets[assetUUID] = {
            type: 'svg',
            value: svg
          };
        }
        (elem as Element<'svg'>).detail.svg = assetUUID;
      } else if (elem.type === 'html') {
        const html = (elem as Element<'html'>).detail.html;
        const assetUUID = createAssetId(html);
        if (isAssetId(html) && !assets[html] && loadItemMap[html] && typeof loadItemMap[html]?.source === 'string') {
          assets[html] = {
            type: 'html',
            value: loadItemMap[html].source as string
          };
        } else if (!assets[assetUUID]) {
          assets[assetUUID] = {
            type: 'html',
            value: html
          };
        }
        (elem as Element<'html'>).detail.html = assetUUID;
      } else if (elem.type === 'group' && Array.isArray((elem as Element<'group'>).detail.children)) {
        const groupAssets = (elem as Element<'group'>).detail.assets || {};
        Object.keys(groupAssets).forEach((assetId) => {
          if (!assets[assetId]) {
            assets[assetId] = groupAssets[assetId];
          }
        });
        delete (elem as Element<'group'>).detail.assets;
        _scanElements((elem as Element<'group'>).detail.children);
      }
    });
  };

  _scanElements(sortedData.elements);
  sortedData.assets = assets;
  return sortedData;
}
