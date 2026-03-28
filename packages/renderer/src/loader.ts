import type {
  RendererLoader,
  LoaderEventMap,
  LoadFunc,
  LoadContent,
  LoadItem,
  LoadItemMap,
  LoadMaterialType,
  StrictMaterial,
  MaterialAssets,
  RecursivePartial,
} from '@idraw/types';
import {
  loadImage,
  loadForeignObject,
  loadSVGCode,
  EventEmitter,
  createAssetId,
  isAssetId,
  createUUID,
} from '@idraw/util';

const supportMaterialTypes: LoadMaterialType[] = ['image', 'svgCode', 'foreignObject'];

const getAssetIdFromMaterial = (material: StrictMaterial<'image' | 'svgCode' | 'foreignObject'>) => {
  let source: string | null = null;
  if (material.type === 'image') {
    source = (material as StrictMaterial<'image'>)?.href || null;
  } else if (material.type === 'svgCode') {
    source = (material as StrictMaterial<'svgCode'>)?.code || null;
  } else if (material.type === 'foreignObject') {
    source = (material as StrictMaterial<'foreignObject'>)?.content || null;
  }
  if (typeof source === 'string' && source) {
    if (isAssetId(source)) {
      return source;
    }
    return createAssetId(source, material.id);
  }
  return createAssetId(`${createUUID()}-${material.id}-${createUUID()}-${createUUID()}`, material.id);
};

export class Loader extends EventEmitter<LoaderEventMap> implements RendererLoader {
  #loadFuncMap: Record<LoadMaterialType | string, LoadFunc<LoadMaterialType, LoadContent>> = {};
  #currentLoadItemMap: LoadItemMap = {};
  #storageLoadItemMap: LoadItemMap = {};
  #hasDestroyed: boolean = false;

  constructor() {
    super();
    this.#registerLoadFunc<'image'>('image', async (mtrl: StrictMaterial<'image'>, assets: MaterialAssets) => {
      const href = assets[mtrl.href]?.value || mtrl.href;
      const content = await loadImage(href);
      return {
        id: mtrl.id,
        lastModified: Date.now(),
        content,
      };
    });
    this.#registerLoadFunc<'foreignObject'>(
      'foreignObject',
      async (mtrl: StrictMaterial<'foreignObject'>, assets: MaterialAssets) => {
        const html = assets[mtrl.content]?.value || mtrl.content;
        const content = await loadForeignObject(html, {
          width: mtrl.originW || mtrl.width,
          height: mtrl.originH || mtrl.height,
        });
        return {
          id: mtrl.id,
          lastModified: Date.now(),
          content,
        };
      }
    );
    this.#registerLoadFunc<'svgCode'>('svgCode', async (mtrl: StrictMaterial<'svgCode'>, assets: MaterialAssets) => {
      const svg = assets[mtrl.code]?.value || mtrl.code;
      const content = await loadSVGCode(svg);
      return {
        id: mtrl.id,
        lastModified: Date.now(),
        content,
      };
    });
  }

  isDestroyed() {
    return this.#hasDestroyed;
  }

  reset() {
    if (this.#hasDestroyed === true) {
      return;
    }
    this.#currentLoadItemMap = {};
    this.#storageLoadItemMap = {};
  }

  resetMaterialAsset(material: StrictMaterial<LoadMaterialType> | RecursivePartial<StrictMaterial>) {
    if (supportMaterialTypes.includes((material as StrictMaterial<LoadMaterialType>).type)) {
      let assetId: string | null = null;
      let resource: string | null = null;
      if (material.type === 'image' && typeof (material as StrictMaterial<'image'>)?.href === 'string') {
        resource = (material as StrictMaterial<'image'>).href;
      } else if (material.type === 'svgCode' && typeof (material as StrictMaterial<'svgCode'>)?.code === 'string') {
        resource = (material as StrictMaterial<'svgCode'>).code;
      } else if (
        material.type === 'foreignObject' &&
        typeof (material as StrictMaterial<'foreignObject'>)?.content === 'string'
      ) {
        resource = (material as StrictMaterial<'foreignObject'>).content;
      }
      if (typeof resource === 'string') {
        this.load(material as StrictMaterial<LoadMaterialType>, {});
        if (isAssetId(resource)) {
          assetId = resource;
        } else if (material.id) {
          assetId = createAssetId(resource, material.id);
        }
      }
      if (assetId && isAssetId(assetId)) {
        delete this.#storageLoadItemMap[assetId];
        delete this.#currentLoadItemMap[assetId];
      }
    }
  }

  destroy() {
    this.#hasDestroyed = true;
    this.clear();
    this.#loadFuncMap = null as any;
    this.#currentLoadItemMap = null as any;
    this.#storageLoadItemMap = null as any;
  }

  #registerLoadFunc<T extends LoadMaterialType>(type: T, func: LoadFunc<T, LoadContent>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.#loadFuncMap[type] = func;
  }

  #getLoadMaterialSource(material: StrictMaterial<LoadMaterialType>): null | string {
    let source: string | null = null;
    if (material.type === 'image') {
      source = (material as StrictMaterial<'image'>)?.href || null;
    } else if (material.type === 'svgCode') {
      source = (material as StrictMaterial<'svgCode'>)?.code || null;
    } else if (material.type === 'foreignObject') {
      source = (material as StrictMaterial<'foreignObject'>)?.content || null;
    }
    return source;
  }

  #createLoadItem(material: StrictMaterial<LoadMaterialType>): LoadItem {
    return {
      material,
      status: 'null',
      content: null,
      error: null,
      startTime: -1,
      endTime: -1,
      source: this.#getLoadMaterialSource(material),
    };
  }

  #emitLoad(item: LoadItem) {
    const assetId = getAssetIdFromMaterial(item.material);
    const storageItem = this.#storageLoadItemMap[assetId];
    if (!this.#hasDestroyed) {
      if (storageItem) {
        if (storageItem.startTime < item.startTime) {
          this.#storageLoadItemMap[assetId] = item;
          this.trigger('load', { ...item, countTime: item.endTime - item.startTime });
        }
      } else {
        this.#storageLoadItemMap[assetId] = item;
        this.trigger('load', { ...item, countTime: item.endTime - item.startTime });
      }
    }
  }

  #emitError(item: LoadItem) {
    const assetId = getAssetIdFromMaterial(item.material);
    const storageItem = this.#storageLoadItemMap?.[assetId];
    if (!this.#hasDestroyed) {
      if (storageItem) {
        if (storageItem.startTime < item.startTime) {
          this.#storageLoadItemMap[assetId] = item;
          this.trigger('error', { ...item, countTime: item.endTime - item.startTime });
        }
      } else {
        this.#storageLoadItemMap[assetId] = item;
        this.trigger('error', { ...item, countTime: item.endTime - item.startTime });
      }
    }
  }

  #loadResource(material: StrictMaterial<LoadMaterialType>, assets: MaterialAssets) {
    const item = this.#createLoadItem(material);
    const assetId = getAssetIdFromMaterial(material);
    if (this.#currentLoadItemMap[assetId]) {
      return;
    }

    this.#currentLoadItemMap[assetId] = item;
    const loadFunc = this.#loadFuncMap[material.type];
    if (typeof loadFunc === 'function' && !this.#hasDestroyed) {
      item.startTime = Date.now();
      loadFunc(material, assets)
        .then((result) => {
          if (!this.#hasDestroyed) {
            item.content = result.content;
            item.endTime = Date.now();
            item.status = 'load';
            this.#emitLoad(item);
          }
        })
        .catch((err: Error) => {
          // eslint-disable-next-line no-console
          console.warn(`Load material source "${item.source}" fail`, err, material);
          item.endTime = Date.now();
          item.status = 'error';
          item.error = err;
          this.#emitError(item);
        });
    }
  }

  #isExistingErrorStorage(material: StrictMaterial<LoadMaterialType>) {
    const assetId = getAssetIdFromMaterial(material);
    const existItem = this.#currentLoadItemMap?.[assetId];
    if (
      existItem &&
      existItem.status === 'error' &&
      existItem.source &&
      existItem.source === this.#getLoadMaterialSource(material)
    ) {
      return true;
    }
    return false;
  }

  load(material: StrictMaterial<LoadMaterialType>, assets: MaterialAssets) {
    if (this.#hasDestroyed === true) {
      return;
    }
    if (this.#isExistingErrorStorage(material)) {
      return;
    }
    if (supportMaterialTypes.includes(material.type)) {
      // const mtrl = deepClone(material);
      this.#loadResource(material, assets);
    }
  }

  getContent(material: StrictMaterial<LoadMaterialType>): LoadContent | null {
    const assetId = getAssetIdFromMaterial(material);
    return this.#storageLoadItemMap?.[assetId]?.content || null;
  }

  getLoadItemMap(): LoadItemMap {
    return this.#storageLoadItemMap;
  }

  setLoadItemMap(itemMap: LoadItemMap) {
    this.#storageLoadItemMap = itemMap;
  }
}
