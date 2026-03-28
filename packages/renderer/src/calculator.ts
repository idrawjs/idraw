import type {
  Point,
  Data,
  Material,
  StrictMaterial,
  MaterialType,
  ViewCalculator,
  ViewCalculatorOptions,
  ViewScaleInfo,
  ViewSizeInfo,
  VirtualFlatStorage,
  BoundingInfo,
  ModifyInfo,
  VirtualItem,
} from '@idraw/types';
import {
  is,
  getViewPointAtMaterial,
  Store,
  calcViewPoint,
  findMaterialFromListByPosition,
  getGroupQueueByMaterialPosition,
  calcMaterialBoundingInfo,
  boundingInfoToRangeBoundingInfo,
} from '@idraw/util';
import { sortMaterialsViewVisiableInfoMap, updateVirtualItemMapStatus } from './visible';
import { calcVirtualAttributes } from './virtual';

export class Calculator implements ViewCalculator {
  #opts: ViewCalculatorOptions;
  #store: Store<VirtualFlatStorage>;

  constructor(opts: ViewCalculatorOptions) {
    this.#opts = opts;
    this.#store = new Store<VirtualFlatStorage>({
      defaultStorage: {
        virtualItemMap: {},
        visibleCount: 0,
        invisibleCount: 0,
      },
    });
  }

  toGridNum(num: number, opts?: { ignore?: boolean }): number {
    if (opts?.ignore === true) {
      return num;
    }
    // TODO
    // const gridUnitSize = 1; // px;
    return Math.round(num);
  }

  destroy() {
    this.#opts = null as any;
  }

  needRender(mtrl: StrictMaterial<MaterialType>): boolean {
    const virtualItemMap = this.#store.get('virtualItemMap');
    const info = virtualItemMap[mtrl.id];
    if (!info) {
      return true;
    }
    return info.isVisibleInView;
  }

  forceVisiable(id: string) {
    const virtualItemMap = this.#store.get('virtualItemMap');
    const info = virtualItemMap[id];
    if (info) {
      info.isVisibleInView = true;
    }
  }

  getPointMaterial(
    p: Point,
    opts: { data: Data; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
  ): { index: number; material: null | StrictMaterial<MaterialType>; groupQueueIndex: number } {
    const context2d = this.#opts.tempContext;
    return getViewPointAtMaterial(p, { ...opts, ...{ context2d } });
  }

  resetVirtualItemMap(
    data: Data,
    opts: {
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void {
    if (data) {
      const { virtualItemMap, invisibleCount, visibleCount } = sortMaterialsViewVisiableInfoMap(data.materials, {
        ...opts,
        ...{
          tempContext: this.#opts.tempContext,
        },
      });
      this.#store.set('virtualItemMap', virtualItemMap);
      this.#store.set('invisibleCount', invisibleCount);
      this.#store.set('visibleCount', visibleCount);
    }
  }

  updateVisiableStatus(opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }) {
    const { virtualItemMap, invisibleCount, visibleCount } = updateVirtualItemMapStatus(
      this.#store.get('virtualItemMap'),
      opts
    );
    this.#store.set('virtualItemMap', virtualItemMap);
    this.#store.set('invisibleCount', invisibleCount);
    this.#store.set('visibleCount', visibleCount);
  }

  calcViewBoundingInfoFromOrigin(
    id: string,
    opts: {
      checkVisible?: boolean;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): BoundingInfo | null {
    const infoData = this.#store.get('virtualItemMap')[id];
    if (!infoData?.boundingInfo) {
      return null;
    }
    const { checkVisible, viewScaleInfo, viewSizeInfo } = opts;
    const { center, left, right, bottom, top, topLeft, topRight, bottomLeft, bottomRight } = infoData.boundingInfo;
    if (checkVisible === true && infoData.isVisibleInView === false) {
      return null;
    }
    const calcOpts = { viewScaleInfo, viewSizeInfo };

    const viewBoundingBox: BoundingInfo = {
      center: calcViewPoint(center, calcOpts),
      left: calcViewPoint(left, calcOpts),
      right: calcViewPoint(right, calcOpts),
      bottom: calcViewPoint(bottom, calcOpts),
      top: calcViewPoint(top, calcOpts),
      topLeft: calcViewPoint(topLeft, calcOpts),
      topRight: calcViewPoint(topRight, calcOpts),
      bottomLeft: calcViewPoint(bottomLeft, calcOpts),
      bottomRight: calcViewPoint(bottomRight, calcOpts),
    };

    return viewBoundingBox;
  }

  calcViewBoundingInfoFromRange(
    id: string,
    opts: {
      checkVisible?: boolean;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): BoundingInfo | null {
    const infoData = this.#store.get('virtualItemMap')[id];
    if (!infoData?.boundingInfo) {
      return null;
    }
    const { checkVisible, viewScaleInfo, viewSizeInfo } = opts;
    const { center, left, right, bottom, top, topLeft, topRight, bottomLeft, bottomRight } = infoData.rangeBoundingInfo;
    if (checkVisible === true && infoData.isVisibleInView === false) {
      return null;
    }
    const calcOpts = { viewScaleInfo, viewSizeInfo };

    const info: BoundingInfo = {
      center: calcViewPoint(center, calcOpts),
      left: calcViewPoint(left, calcOpts),
      right: calcViewPoint(right, calcOpts),
      bottom: calcViewPoint(bottom, calcOpts),
      top: calcViewPoint(top, calcOpts),
      topLeft: calcViewPoint(topLeft, calcOpts),
      topRight: calcViewPoint(topRight, calcOpts),
      bottomLeft: calcViewPoint(bottomLeft, calcOpts),
      bottomRight: calcViewPoint(bottomRight, calcOpts),
    };

    return info;
  }

  modifyVirtualAttributes(
    material: StrictMaterial,
    opts: {
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
      groupQueue: StrictMaterial<'group'>[];
    }
  ): void {
    const { viewSizeInfo, groupQueue } = opts;
    const virtualItemMap = this.#store.get('virtualItemMap');
    const vItem = virtualItemMap[material.id];
    // const position = vItem.position;

    const vAttributes = calcVirtualAttributes(material, {
      tempContext: this.#opts.tempContext,
      dpr: viewSizeInfo.devicePixelRatio,
      groupQueue,
    });
    if (vAttributes) {
      const boundingInfo = calcMaterialBoundingInfo(material, {
        groupQueue,
      });
      const newVirtualItem: VirtualItem = {
        ...vItem,
        ...vAttributes,
        boundingInfo,
        rangeBoundingInfo: is.angle(material.angle) ? boundingInfoToRangeBoundingInfo(boundingInfo) : boundingInfo,
      };
      virtualItemMap[material.id] = newVirtualItem;
      this.#store.set('virtualItemMap', virtualItemMap);
    }
  }

  modifyVirtualItemMap(
    data: Data,
    opts: {
      modifyInfo: ModifyInfo; // TODO
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void {
    const { modifyInfo, viewScaleInfo, viewSizeInfo } = opts;
    const { type, content } = modifyInfo;
    const list = data.materials;
    const virtualItemMap = this.#store.get('virtualItemMap');
    if (type === 'deleteMaterial') {
      const { material } = content as ModifyInfo<'deleteMaterial'>['content'];
      const ids: string[] = [];
      const _walk = (e: Material) => {
        ids.push(e.id);
        if (e.type === 'group' && Array.isArray((e as StrictMaterial<'group'>).children)) {
          (e as StrictMaterial<'group'>).children.forEach((child) => {
            _walk(child);
          });
        }
      };
      _walk(material);
      ids.forEach((id) => {
        delete virtualItemMap[id];
      });
      this.#store.set('virtualItemMap', virtualItemMap);
    }
    // else if (type === 'updateMaterial') {
    //   // TODO
    //   this.resetVirtualItemMap(data, { viewScaleInfo, viewSizeInfo });
    // }
    else if (type === 'addMaterial' || type === 'updateMaterial') {
      const { position } = content as ModifyInfo<'addMaterial'>['content'];
      const material = findMaterialFromListByPosition(position, data.materials);
      const groupQueue = getGroupQueueByMaterialPosition(list, position);
      if (material) {
        if (type === 'updateMaterial' && material.type === 'group') {
          // TODO
          this.resetVirtualItemMap(data, { viewScaleInfo, viewSizeInfo });
        } else {
          const boundingInfo = calcMaterialBoundingInfo(material, {
            groupQueue: groupQueue || [],
          });
          const newVirtualItem: VirtualItem = {
            type: material.type,
            boundingInfo,
            rangeBoundingInfo: is.angle(material.angle) ? boundingInfoToRangeBoundingInfo(boundingInfo) : boundingInfo,
            isVisibleInView: true,
            position: [...position],
            ...calcVirtualAttributes(material, {
              tempContext: this.#opts.tempContext,
              dpr: viewSizeInfo.devicePixelRatio,
              groupQueue: groupQueue || [],
            }),
          };
          virtualItemMap[material.id] = newVirtualItem;
          this.#store.set('virtualItemMap', virtualItemMap);
          if (type === 'updateMaterial') {
            this.updateVisiableStatus({ viewScaleInfo, viewSizeInfo });
          }
        }
      }
    } else if (type === 'moveMaterial') {
      this.resetVirtualItemMap(data, { viewScaleInfo, viewSizeInfo });
    }
  }

  getVirtualItem(id: string): VirtualItem | null {
    const itemMap = this.#store.get('virtualItemMap');
    return itemMap[id] || null;
  }
}
