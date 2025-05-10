import type {
  Point,
  Data,
  Element,
  ElementType,
  ViewCalculator,
  ViewCalculatorOptions,
  ViewScaleInfo,
  ViewSizeInfo,
  VirtualFlatStorage,
  ViewRectInfo,
  ModifyInfo,
  VirtualFlatItem
} from '@idraw/types';
import {
  is,
  getViewPointAtElement,
  Store,
  calcViewPointSize,
  findElementFromListByPosition,
  getGroupQueueByElementPosition,
  calcElementOriginRectInfo,
  originRectInfoToRangeRectInfo
  // elementToBoxInfo
} from '@idraw/util';
import { sortElementsViewVisiableInfoMap, updateVirtualFlatItemMapStatus } from './view-visible';
import { calcVirtualFlatDetail } from './virtual-flat';
import { calcVirtualTextDetail } from './virtual-flat/text';

export class Calculator implements ViewCalculator {
  #opts: ViewCalculatorOptions;
  #store: Store<VirtualFlatStorage>;

  constructor(opts: ViewCalculatorOptions) {
    this.#opts = opts;
    this.#store = new Store<VirtualFlatStorage>({
      defaultStorage: {
        virtualFlatItemMap: {},
        visibleCount: 0,
        invisibleCount: 0
      }
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

  needRender(elem: Element<ElementType>): boolean {
    const virtualFlatItemMap = this.#store.get('virtualFlatItemMap');
    const info = virtualFlatItemMap[elem.uuid];
    if (!info) {
      return true;
    }
    return info.isVisibleInView;
  }

  getPointElement(
    p: Point,
    opts: { data: Data; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
  ): { index: number; element: null | Element<ElementType>; groupQueueIndex: number } {
    const context2d = this.#opts.tempContext;
    return getViewPointAtElement(p, { ...opts, ...{ context2d } });
  }

  resetVirtualFlatItemMap(
    data: Data,
    opts: {
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void {
    if (data) {
      const { virtualFlatItemMap, invisibleCount, visibleCount } = sortElementsViewVisiableInfoMap(data.elements, {
        ...opts,
        ...{
          tempContext: this.#opts.tempContext
        }
      });
      this.#store.set('virtualFlatItemMap', virtualFlatItemMap);
      this.#store.set('invisibleCount', invisibleCount);
      this.#store.set('visibleCount', visibleCount);
    }
  }

  updateVisiableStatus(opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }) {
    const { virtualFlatItemMap, invisibleCount, visibleCount } = updateVirtualFlatItemMapStatus(
      this.#store.get('virtualFlatItemMap'),
      opts
    );
    this.#store.set('virtualFlatItemMap', virtualFlatItemMap);
    this.#store.set('invisibleCount', invisibleCount);
    this.#store.set('visibleCount', visibleCount);
  }

  calcViewRectInfoFromOrigin(
    uuid: string,
    opts: {
      checkVisible?: boolean;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): ViewRectInfo | null {
    const infoData = this.#store.get('virtualFlatItemMap')[uuid];
    if (!infoData?.originRectInfo) {
      return null;
    }
    const { checkVisible, viewScaleInfo, viewSizeInfo } = opts;
    const { center, left, right, bottom, top, topLeft, topRight, bottomLeft, bottomRight } = infoData.originRectInfo;
    if (checkVisible === true && infoData.isVisibleInView === false) {
      return null;
    }
    const calcOpts = { viewScaleInfo, viewSizeInfo };

    const viewRectInfo: ViewRectInfo = {
      center: calcViewPointSize(center, calcOpts),
      left: calcViewPointSize(left, calcOpts),
      right: calcViewPointSize(right, calcOpts),
      bottom: calcViewPointSize(bottom, calcOpts),
      top: calcViewPointSize(top, calcOpts),
      topLeft: calcViewPointSize(topLeft, calcOpts),
      topRight: calcViewPointSize(topRight, calcOpts),
      bottomLeft: calcViewPointSize(bottomLeft, calcOpts),
      bottomRight: calcViewPointSize(bottomRight, calcOpts)
    };

    return viewRectInfo;
  }

  calcViewRectInfoFromRange(
    uuid: string,
    opts: {
      checkVisible?: boolean;
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): ViewRectInfo | null {
    const infoData = this.#store.get('virtualFlatItemMap')[uuid];
    if (!infoData?.originRectInfo) {
      return null;
    }
    const { checkVisible, viewScaleInfo, viewSizeInfo } = opts;
    const { center, left, right, bottom, top, topLeft, topRight, bottomLeft, bottomRight } = infoData.rangeRectInfo;
    if (checkVisible === true && infoData.isVisibleInView === false) {
      return null;
    }
    const calcOpts = { viewScaleInfo, viewSizeInfo };

    const viewRectInfo: ViewRectInfo = {
      center: calcViewPointSize(center, calcOpts),
      left: calcViewPointSize(left, calcOpts),
      right: calcViewPointSize(right, calcOpts),
      bottom: calcViewPointSize(bottom, calcOpts),
      top: calcViewPointSize(top, calcOpts),
      topLeft: calcViewPointSize(topLeft, calcOpts),
      topRight: calcViewPointSize(topRight, calcOpts),
      bottomLeft: calcViewPointSize(bottomLeft, calcOpts),
      bottomRight: calcViewPointSize(bottomRight, calcOpts)
    };

    return viewRectInfo;
  }

  modifyText(element: Element<'text'>): void {
    const virtualFlatItemMap = this.#store.get('virtualFlatItemMap');
    const flatItem = virtualFlatItemMap[element.uuid];
    if (element && element.type === 'text') {
      const newVirtualFlatItem: VirtualFlatItem = {
        ...flatItem,
        ...calcVirtualTextDetail(element, {
          tempContext: this.#opts.tempContext
        })
      };
      virtualFlatItemMap[element.uuid] = newVirtualFlatItem;
      this.#store.set('virtualFlatItemMap', virtualFlatItemMap);
    }
  }

  modifyVirtualFlatItemMap(
    data: Data,
    opts: {
      modifyInfo: ModifyInfo; // TODO
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void {
    const { modifyInfo, viewScaleInfo, viewSizeInfo } = opts;
    const { type, content } = modifyInfo;
    const list = data.elements;
    const virtualFlatItemMap = this.#store.get('virtualFlatItemMap');
    if (type === 'deleteElement') {
      const { element } = content as ModifyInfo<'deleteElement'>['content'];
      const uuids: string[] = [];
      const _walk = (e: Element) => {
        uuids.push(e.uuid);
        if (e.type === 'group' && Array.isArray((e as Element<'group'>).detail.children)) {
          (e as Element<'group'>).detail.children.forEach((child) => {
            _walk(child);
          });
        }
      };
      _walk(element);
      uuids.forEach((uuid) => {
        delete virtualFlatItemMap[uuid];
      });
      this.#store.set('virtualFlatItemMap', virtualFlatItemMap);
    }
    // else if (type === 'updateElement') {
    //   // TODO
    //   this.resetVirtualFlatItemMap(data, { viewScaleInfo, viewSizeInfo });
    // }
    else if (type === 'addElement' || type === 'updateElement') {
      const { position } = content as ModifyInfo<'addElement'>['content'];
      const element = findElementFromListByPosition(position, data.elements);
      const groupQueue = getGroupQueueByElementPosition(list, position);
      if (element) {
        if (type === 'updateElement' && element.type === 'group') {
          // TODO
          this.resetVirtualFlatItemMap(data, { viewScaleInfo, viewSizeInfo });
        } else {
          const originRectInfo = calcElementOriginRectInfo(element, {
            groupQueue: groupQueue || []
          });
          const newVirtualFlatItem: VirtualFlatItem = {
            type: element.type,
            originRectInfo,
            rangeRectInfo: is.angle(element.angle) ? originRectInfoToRangeRectInfo(originRectInfo) : originRectInfo,
            isVisibleInView: true,
            position: [...position],
            ...calcVirtualFlatDetail(element, {
              tempContext: this.#opts.tempContext
            })
          };
          virtualFlatItemMap[element.uuid] = newVirtualFlatItem;
          this.#store.set('virtualFlatItemMap', virtualFlatItemMap);
          if (type === 'updateElement') {
            this.updateVisiableStatus({ viewScaleInfo, viewSizeInfo });
          }
        }
      }
    } else if (type === 'moveElement') {
      this.resetVirtualFlatItemMap(data, { viewScaleInfo, viewSizeInfo });
    }
  }

  getVirtualFlatItem(uuid: string): VirtualFlatItem | null {
    const itemMap = this.#store.get('virtualFlatItemMap');
    return itemMap[uuid] || null;
  }
}
