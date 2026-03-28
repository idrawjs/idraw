import type { ViewScaleInfo, ViewCalculator, ViewSizeInfo } from './view';
import type { Material, StrictMaterial, MaterialSize, MaterialAssets } from './material';
import type { LoaderEventMap, LoadMaterialType, LoadContent, LoadItemMap } from './loader';
import type { UtilEventEmitter, RecursivePartial } from './util';
import type { StoreSharer } from './store';
import { ViewContext2D } from '@idraw/types';

export interface RendererOptions {
  viewContext: ViewContext2D;
  tempContext: ViewContext2D;
  sharer?: StoreSharer;
}

export interface RendererEvent {
  viewContext: ViewContext2D;
}

export interface RendererEventMap {
  load: LoaderEventMap['load'];
}

export interface RendererLoader extends UtilEventEmitter<LoaderEventMap> {
  // load(material: StrictMaterial<LoadMaterialType>): void;
  load(material: StrictMaterial<LoadMaterialType>, assets: MaterialAssets): void;
  getContent(material: StrictMaterial<LoadMaterialType>): LoadContent | null;
  getLoadItemMap(): LoadItemMap;
  setLoadItemMap(itemMap: LoadItemMap): void;
  destroy(): void;
  isDestroyed(): boolean;
}

export interface RendererDrawOptions {
  viewSizeInfo: ViewSizeInfo;
  viewScaleInfo: ViewScaleInfo;
  forceDrawAll?: boolean;
}

export interface RendererDrawMaterialOptions extends RendererDrawOptions {
  loader: RendererLoader;
  calculator: ViewCalculator;
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
  parentMaterialSize: MaterialSize;
  materialAssets?: MaterialAssets;
  parentOpacity: number;
  overrideMaterialMap?: Record<string, RecursivePartial<StrictMaterial>> | null;
  tempContext: ViewContext2D;
}

export interface RenderMaterialHelperOptions {
  material: Material | null;
  groupQueue: StrictMaterial<'group'>[];
  calculator: ViewCalculator;
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
}
