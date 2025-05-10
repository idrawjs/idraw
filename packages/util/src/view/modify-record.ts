import type { FlattenElement, Element, RecursivePartial, DataLayout, DataGlobal } from '@idraw/types';
import { flatObject } from '../tool/flat-object';

export function toFlattenElement(elem: Element | RecursivePartial<Element>): FlattenElement {
  return flatObject(elem, { ignorePaths: ['detail.children'] });
}

export function toFlattenLayout(layout: DataLayout | RecursivePartial<DataLayout>): FlattenElement {
  return flatObject(layout);
}

export function toFlattenGlobal(global: DataGlobal | RecursivePartial<DataLayout>): FlattenElement {
  return flatObject(global);
}
