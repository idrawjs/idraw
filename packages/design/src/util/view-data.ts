import { deepClone } from '@idraw/util';
import type { Data, Element, ElementType, ElementBaseDesc } from '@idraw/types';
import type { DesignComponent, DesignComponentItem } from '../types';

const baseDescKeys = ['borderWidth', 'borderColor', 'borderRadius', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'color', 'bgColor'];

function parseElementBaseDesc(elem: DesignComponent | DesignComponentItem | Element<ElementType>): ElementBaseDesc {
  const baseDesc: ElementBaseDesc = {};
  if (elem?.desc) {
    Object.keys(elem.desc).forEach((name: string) => {
      if (baseDescKeys.includes(name)) {
        baseDesc[name as keyof ElementBaseDesc] = (elem.desc as any)?.[name];
      }
    });
  }
  return baseDesc;
}

function parseComponentItemToElement(item: DesignComponentItem): Element<'group'> {
  const elem: Element<'group'> = {
    uuid: item.uuid,
    name: item.name,
    type: 'group',
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    desc: {
      ...parseElementBaseDesc(item),
      ...{
        children: []
      }
    }
  };
  item.desc?.children?.forEach?.((child) => {
    if (child.type === 'component-item') {
      const childElem = parseComponentItemToElement(child);
      elem.desc.children.push(childElem);
    } else {
      const childElem = deepClone(child);
      elem.desc.children.push(childElem);
    }
  });
  return elem;
}

function parseComponentToElement(comp: DesignComponent): Element<'group'> {
  const elem: Element<'group'> = {
    uuid: comp.uuid,
    name: comp.name,
    type: 'group',
    x: comp.x,
    y: comp.y,
    w: comp.w,
    h: comp.h,
    desc: {
      ...parseElementBaseDesc(comp),
      ...{
        children: []
      }
    }
  };

  if (comp?.desc?.default) {
    elem.desc.children.push(parseComponentItemToElement(comp.desc.default));
  }
  if (comp?.desc?.variants && Array.isArray(comp?.desc?.variants)) {
    comp.desc.variants.forEach((item) => {
      elem.desc.children.push(parseComponentItemToElement(item));
    });
  }

  return elem;
}

export function parseComponentsToDrawData(components: DesignComponent[]): Data {
  const data: Data = {
    elements: []
  };
  components.forEach((comp: DesignComponent) => {
    const elem = parseComponentToElement(comp);
    data.elements.push(elem);
  });
  return data;
}
