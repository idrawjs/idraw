import type { RendererLoader, LoaderEventMap, LoadFunc, LoadContent, LoadItem, LoadElementType, Element, ElementAssets } from '@idraw/types';
import { loadImage, loadHTML, loadSVG, EventEmitter, createAssetId, isAssetId, createUUID } from '@idraw/util';

interface LoadItemMap {
  [assetId: string]: LoadItem;
}

const supportElementTypes: LoadElementType[] = ['image', 'svg', 'html'];

const getAssetIdFromElement = (element: Element<'image' | 'svg' | 'html'>) => {
  let source: string | null = null;
  if (element.type === 'image') {
    source = (element as Element<'image'>)?.detail?.src || null;
  } else if (element.type === 'svg') {
    source = (element as Element<'svg'>)?.detail?.svg || null;
  } else if (element.type === 'html') {
    source = (element as Element<'html'>)?.detail?.html || null;
  }
  if (typeof source === 'string' && source) {
    if (isAssetId(source)) {
      return source;
    }
    return createAssetId(source);
  }
  return createAssetId(`${createUUID()}-${element.uuid}-${createUUID()}-${createUUID()}`);
};

export class Loader extends EventEmitter<LoaderEventMap> implements RendererLoader {
  private _loadFuncMap: Record<LoadElementType | string, LoadFunc<LoadElementType, LoadContent>> = {};
  private _currentLoadItemMap: LoadItemMap = {};
  private _storageLoadItemMap: LoadItemMap = {};

  constructor() {
    super();
    this._registerLoadFunc<'image'>('image', async (elem: Element<'image'>, assets: ElementAssets) => {
      const src = assets[elem.detail.src]?.value || elem.detail.src;
      const content = await loadImage(src);
      return {
        uuid: elem.uuid,
        lastModified: Date.now(),
        content
      };
    });
    this._registerLoadFunc<'html'>('html', async (elem: Element<'html'>, assets: ElementAssets) => {
      const html = assets[elem.detail.html]?.value || elem.detail.html;
      const content = await loadHTML(html, {
        width: elem.detail.width || elem.w,
        height: elem.detail.height || elem.h
      });
      return {
        uuid: elem.uuid,
        lastModified: Date.now(),
        content
      };
    });
    this._registerLoadFunc<'svg'>('svg', async (elem: Element<'svg'>, assets: ElementAssets) => {
      const svg = assets[elem.detail.svg]?.value || elem.detail.svg;
      const content = await loadSVG(svg);
      return {
        uuid: elem.uuid,
        lastModified: Date.now(),
        content
      };
    });
  }
  private _registerLoadFunc<T extends LoadElementType>(type: T, func: LoadFunc<T, LoadContent>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._loadFuncMap[type] = func;
  }

  private _getLoadElementSource(element: Element<LoadElementType>): null | string {
    let source: string | null = null;
    if (element.type === 'image') {
      source = (element as Element<'image'>)?.detail?.src || null;
    } else if (element.type === 'svg') {
      source = (element as Element<'svg'>)?.detail?.svg || null;
    } else if (element.type === 'html') {
      source = (element as Element<'html'>)?.detail?.html || null;
    }
    return source;
  }

  private _createLoadItem(element: Element<LoadElementType>): LoadItem {
    return {
      element,
      status: 'null',
      content: null,
      error: null,
      startTime: -1,
      endTime: -1,
      source: this._getLoadElementSource(element)
    };
  }

  private _emitLoad(item: LoadItem) {
    const assetId = getAssetIdFromElement(item.element);
    const storageItem = this._storageLoadItemMap[assetId];
    if (storageItem) {
      if (storageItem.startTime < item.startTime) {
        this._storageLoadItemMap[assetId] = item;
        this.trigger('load', { ...item, countTime: item.endTime - item.startTime });
      }
    } else {
      this._storageLoadItemMap[assetId] = item;
      this.trigger('load', { ...item, countTime: item.endTime - item.startTime });
    }
  }

  private _emitError(item: LoadItem) {
    const assetId = getAssetIdFromElement(item.element);
    const storageItem = this._storageLoadItemMap[assetId];
    if (storageItem) {
      if (storageItem.startTime < item.startTime) {
        this._storageLoadItemMap[assetId] = item;
        this.trigger('error', { ...item, countTime: item.endTime - item.startTime });
      }
    } else {
      this._storageLoadItemMap[assetId] = item;
      this.trigger('error', { ...item, countTime: item.endTime - item.startTime });
    }
  }

  private _loadResource(element: Element<LoadElementType>, assets: ElementAssets) {
    const item = this._createLoadItem(element);
    const assetId = getAssetIdFromElement(element);

    this._currentLoadItemMap[assetId] = item;
    const loadFunc = this._loadFuncMap[element.type];
    if (typeof loadFunc === 'function') {
      item.startTime = Date.now();
      loadFunc(element, assets)
        .then((result) => {
          item.content = result.content;
          item.endTime = Date.now();
          item.status = 'load';
          this._emitLoad(item);
        })
        .catch((err: Error) => {
          console.warn(`Load element source "${item.source}" fail`, err, element);
          item.endTime = Date.now();
          item.status = 'error';
          item.error = err;
          this._emitError(item);
        });
    }
  }

  private _isExistingErrorStorage(element: Element<LoadElementType>) {
    const assetId = getAssetIdFromElement(element);
    const existItem = this._currentLoadItemMap?.[assetId];
    if (existItem && existItem.status === 'error' && existItem.source && existItem.source === this._getLoadElementSource(element)) {
      return true;
    }
    return false;
  }

  load(element: Element<LoadElementType>, assets: ElementAssets) {
    if (this._isExistingErrorStorage(element)) {
      return;
    }
    if (supportElementTypes.includes(element.type)) {
      // const elem = deepClone(element);
      this._loadResource(element, assets);
    }
  }

  getContent(element: Element<LoadElementType>): LoadContent | null {
    const assetId = getAssetIdFromElement(element);
    return this._storageLoadItemMap?.[assetId]?.content || null;
  }
}
