import type {
  Point,
  Data,
  Element,
  ElementType,
  ViewCalculator,
  ViewCalculatorOptions,
  ViewScaleInfo,
  ElementSize,
  ViewSizeInfo,
  ViewCalculatorStorage,
  ViewRectInfo,
  ModifyOptions,
  ViewVisibleInfo
} from '@idraw/types';
import {
  is,
  isViewPointInElement,
  getViewPointAtElement,
  isElementInView,
  Store,
  sortElementsViewVisiableInfoMap,
  updateViewVisibleInfoMapStatus,
  calcViewPointSize,
  findElementFromListByPosition,
  getGroupQueueByElementPosition,
  calcElementOriginRectInfo,
  originRectInfoToRangeRectInfo
} from '@idraw/util';

export class Calculator implements ViewCalculator {
  #opts: ViewCalculatorOptions;
  #store: Store<ViewCalculatorStorage>;

  constructor(opts: ViewCalculatorOptions) {
    this.#opts = opts;
    this.#store = new Store<ViewCalculatorStorage>({
      defaultStorage: {
        viewVisibleInfoMap: {},
        visibleCount: 0,
        invisibleCount: 0
      }
    });
  }

  toGridNum(num: number): number {
    // TODO
    // const gridUnitSize = 1; // px;
    return Math.round(num);
  }

  destroy() {
    this.#opts = null as any;
  }

  isElementInView(elem: ElementSize, viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): boolean {
    return isElementInView(elem, { viewScaleInfo, viewSizeInfo });
  }

  isPointInElement(p: Point, elem: Element<ElementType>, viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): boolean {
    const context2d = this.#opts.viewContext;
    return isViewPointInElement(p, {
      context2d,
      element: elem,
      viewScaleInfo,
      viewSizeInfo
    });
  }

  getPointElement(
    p: Point,
    opts: { data: Data; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
  ): { index: number; element: null | Element<ElementType>; groupQueueIndex: number } {
    const context2d = this.#opts.viewContext;
    return getViewPointAtElement(p, { ...opts, ...{ context2d } });
  }

  resetViewVisibleInfoMap(
    data: Data,
    opts: {
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void {
    if (data) {
      const { viewVisibleInfoMap, invisibleCount, visibleCount } = sortElementsViewVisiableInfoMap(data.elements, opts);
      this.#store.set('viewVisibleInfoMap', viewVisibleInfoMap);
      this.#store.set('invisibleCount', invisibleCount);
      this.#store.set('visibleCount', visibleCount);
    }
  }

  updateVisiableStatus(opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }) {
    const { viewVisibleInfoMap, invisibleCount, visibleCount } = updateViewVisibleInfoMapStatus(this.#store.get('viewVisibleInfoMap'), opts);
    this.#store.set('viewVisibleInfoMap', viewVisibleInfoMap);
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
    const infoData = this.#store.get('viewVisibleInfoMap')[uuid];
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
    const infoData = this.#store.get('viewVisibleInfoMap')[uuid];
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

  modifyViewVisibleInfoMap(
    data: Data,
    opts: {
      modifyOptions: ModifyOptions; // TODO
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void {
    const { modifyOptions, viewScaleInfo, viewSizeInfo } = opts;
    const { type, content } = modifyOptions;
    const list = data.elements;
    const viewVisibleInfoMap = this.#store.get('viewVisibleInfoMap');
    if (type === 'deleteElement') {
      const { element } = content as ModifyOptions<'deleteElement'>['content'];
      delete viewVisibleInfoMap[element.uuid];
    } else if (type === 'addElement' || type === 'updateElement') {
      const { position } = content as ModifyOptions<'addElement'>['content'];
      const element = findElementFromListByPosition(position, data.elements);
      const groupQueue = getGroupQueueByElementPosition(list, position);
      if (element) {
        const originRectInfo = calcElementOriginRectInfo(element, {
          groupQueue: groupQueue || []
        });
        const newViewVisibleInfo: ViewVisibleInfo = {
          originRectInfo,
          rangeRectInfo: is.angle(element.angle) ? originRectInfoToRangeRectInfo(originRectInfo) : originRectInfo,
          isVisibleInView: true,
          isGroup: element?.type === 'group',
          position: [...position]
        };
        viewVisibleInfoMap[element.uuid] = newViewVisibleInfo;
        if (type === 'updateElement') {
          this.updateVisiableStatus({ viewScaleInfo, viewSizeInfo });
        }
      }
    } else if (type === 'moveElement') {
      this.resetViewVisibleInfoMap(data, { viewScaleInfo, viewSizeInfo });
    }
    this.#store.set('viewVisibleInfoMap', viewVisibleInfoMap);
  }
}
