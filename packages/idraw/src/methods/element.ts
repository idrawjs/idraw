import type { Data, Element, ElementType, ElementPosition, RecursivePartial } from '@idraw/types';
import { Core, coreEventKeys } from '@idraw/core';
import { IDrawEvent } from '../event';

export function createElement<T extends ElementType = ElementType>(
  depOptions: {
    core: Core<IDrawEvent>;
  },
  type: T,
  element: RecursivePartial<Element<T>>,
  opts?: {
    viewCenter?: boolean;
  }
): Element<T> {
  const { core } = depOptions;
  return core.createElement<T>(type, element, opts);
}

export function updateElement(
  depOptions: {
    core: Core<IDrawEvent>;
  },
  element: Element
) {
  const { core } = depOptions;

  const modifyRecord = core.updateElement(element);
  if (!modifyRecord) {
    return;
  }
  const data = core.getData();
  if (!data) {
    return;
  }
  core.trigger(coreEventKeys.CHANGE, { data, type: 'updateElement', modifyRecord });
}

export function modifyElement(
  depOptions: {
    core: Core<IDrawEvent>;
  },
  element: RecursivePartial<Omit<Element, 'uuid'>> & Pick<Element, 'uuid'>
) {
  const { core } = depOptions;
  const modifyRecord = core.modifyElement(element);
  if (!modifyRecord) {
    return;
  }
  const data = core.getData();
  if (!data) {
    return;
  }
  core.trigger(coreEventKeys.CHANGE, { data, type: 'modifyElement', modifyRecord });
}

export function addElement(
  depOptions: {
    core: Core<IDrawEvent>;
  },
  element: Element,
  opts?: {
    position: ElementPosition;
  }
): Data {
  const { core } = depOptions;
  const modifyRecord = core.addElement(element, opts);
  const data = core.getData() as Data;
  core.trigger(coreEventKeys.CHANGE, { data, type: 'addElement', modifyRecord });
  return data;
}

export function deleteElement(depOptions: { core: Core<IDrawEvent> }, uuid: string) {
  const { core } = depOptions;
  const modifyRecord = core.deleteElement(uuid);
  const data = core.getData() as Data;
  core.trigger(coreEventKeys.CHANGE, { data, type: 'deleteElement', modifyRecord });
}

export function moveElement(depOptions: { core: Core<IDrawEvent> }, uuid: string, to: ElementPosition) {
  const { core } = depOptions;
  const modifyRecord = core.moveElement(uuid, to);
  const data = core.getData() as Data;
  core.trigger(coreEventKeys.CHANGE, { data, type: 'moveElement', modifyRecord });
}
