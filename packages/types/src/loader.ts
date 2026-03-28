import type { MaterialType, StrictMaterial, MaterialAssets } from './material';

export type LoadMaterialType = 'image' | 'svgCode' | 'foreignObject';

export interface LoadItem {
  material: StrictMaterial<LoadMaterialType>;
  status: 'null' | 'load' | 'error';
  content: LoadContent | null;
  startTime: number;
  endTime: number;
  error?: any;
  source: string | null;
}

export interface LoadItemMap {
  [assetId: string]: LoadItem;
}

export interface LoaderEvent extends LoadItem {
  countTime: number;
}

export interface LoaderEventMap {
  load: LoaderEvent;
  error: LoaderEvent;
}

export interface LoadResult<C> {
  id: string;
  lastModified: number;
  content: C;
}

export type LoadContent = HTMLImageElement | HTMLCanvasElement;

export type LoadFunc<T extends MaterialType, C extends LoadContent> = (
  material: StrictMaterial<T>,
  assets: MaterialAssets
) => Promise<LoadResult<C>>;
