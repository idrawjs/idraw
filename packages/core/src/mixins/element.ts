import { DataElement, DataElemDesc, DataElementBase } from '@idraw/types';
import { deepClone, createUUID } from '@idraw/util';
import { diffElementResourceChange } from '../lib/diff';
import Core from '../index';
import { Mode } from '../constant/static';

export function getSelectedElements(
  core: Core
): DataElement<keyof DataElemDesc>[] {
  const elems: DataElement<keyof DataElemDesc>[] = [];
  let list: string[] = [];
  const uuid = core.getEngine().temp.get('selectedUUID');
  if (typeof uuid === 'string' && uuid) {
    list.push(uuid);
  } else {
    list = core.getEngine().temp.get('selectedUUIDList');
  }
  list.forEach((uuid) => {
    const index = core.getEngine().helper.getElementIndexByUUID(uuid);
    if (index !== null && index >= 0) {
      const elem = core.$data.elements[index];
      if (elem) elems.push(elem);
    }
  });
  return deepClone(elems);
}

export function getElement(
  core: Core,
  uuid: string
): DataElement<keyof DataElemDesc> | null {
  let elem: DataElement<keyof DataElemDesc> | null = null;
  const index = core.getEngine().helper.getElementIndexByUUID(uuid);
  if (index !== null && core.$data.elements[index]) {
    elem = deepClone(core.$data.elements[index]);
  }
  return elem;
}

export function getElementByIndex(
  core: Core,
  index: number
): DataElement<keyof DataElemDesc> | null {
  let elem: DataElement<keyof DataElemDesc> | null = null;
  if (index >= 0 && core.$data.elements[index]) {
    elem = deepClone(core.$data.elements[index]);
  }
  return elem;
}

export function updateElement(
  core: Core,
  elem: DataElement<keyof DataElemDesc>
) {
  const _elem = deepClone(elem) as DataElement<keyof DataElemDesc>;
  const data = core.getData();
  const resourceChangeUUIDs: string[] = [];
  for (let i = 0; i < data.elements.length; i++) {
    if (_elem.uuid === data.elements[i]?.uuid) {
      const result = diffElementResourceChange(data.elements[i], _elem);
      if (typeof result === 'string') {
        resourceChangeUUIDs.push(result);
      }
      data.elements[i] = _elem;
      core.setData(data);
      break;
    }
  }
  core.$emitChangeData();
  core.$draw({ resourceChangeUUIDs });
}

export function selectElementByIndex(core: Core, index: number): void {
  if (core.$data.elements[index]) {
    const uuid = core.$data.elements[index].uuid;
    core.getEngine().temp.set('mode', Mode.NULL);
    if (typeof uuid === 'string') {
      core.getEngine().temp.set('selectedUUID', uuid);
      core.getEngine().temp.set('selectedUUIDList', []);
    }
    core.$draw();
  }
}

export function selectElement(core: Core, uuid: string): void {
  const index = core.getEngine().helper.getElementIndexByUUID(uuid);
  if (typeof index === 'number' && index >= 0) {
    core.selectElementByIndex(index);
  }
}

export function cancelElementByIndex(core: Core, index: number): void {
  if (core.$data.elements[index]) {
    const uuid = core.$data.elements[index].uuid;
    const selectedUUID = core.getEngine().temp.get('selectedUUID');
    if (typeof uuid === 'string' && uuid === selectedUUID) {
      core.getEngine().temp.set('mode', Mode.NULL);
      core.getEngine().temp.set('selectedUUID', null);
      core.getEngine().temp.set('selectedUUIDList', []);
    }
    core.$draw();
  }
}

export function cancelElement(core: Core, uuid: string): void {
  const index = core.getEngine().helper.getElementIndexByUUID(uuid);
  if (typeof index === 'number' && index >= 0) {
    core.cancelElementByIndex(index);
  }
}

export function moveUpElement(core: Core, uuid: string): void {
  const index = core.getEngine().helper.getElementIndexByUUID(uuid);
  if (
    typeof index === 'number' &&
    index >= 0 &&
    index < core.$data.elements.length - 1
  ) {
    const temp = core.$data.elements[index];
    core.$data.elements[index] = core.$data.elements[index + 1];
    core.$data.elements[index + 1] = temp;
  }
  core.$emitChangeData();
  core.$draw();
}

export function moveDownElement(core: Core, uuid: string): void {
  const index = core.getEngine().helper.getElementIndexByUUID(uuid);
  if (
    typeof index === 'number' &&
    index > 0 &&
    index < core.$data.elements.length
  ) {
    const temp = core.$data.elements[index];
    core.$data.elements[index] = core.$data.elements[index - 1];
    core.$data.elements[index - 1] = temp;
  }
  core.$emitChangeData();
  core.$draw();
}

export function addElement(
  core: Core,
  elem: DataElementBase<keyof DataElemDesc>
): string | null {
  const _elem = deepClone(elem);
  _elem.uuid = createUUID();
  core.$data.elements.push(_elem);
  core.$emitChangeData();
  core.$draw();
  return _elem.uuid;
}

export function deleteElement(core: Core, uuid: string) {
  const index = core.$getElementHandler().getElementIndex(core.getData(), uuid);
  if (index >= 0) {
    core.$data.elements.splice(index, 1);
    core.$emitChangeData();
    core.$draw();
  }
}

export function insertElementBefore(
  core: Core,
  elem: DataElementBase<keyof DataElemDesc>,
  beforeUUID: string
) {
  const index = core.getEngine().helper.getElementIndexByUUID(beforeUUID);
  if (index !== null) {
    return core.insertElementBeforeIndex(elem, index);
  }
  return null;
}

export function insertElementBeforeIndex(
  core: Core,
  elem: DataElementBase<keyof DataElemDesc>,
  index: number
) {
  const _elem = deepClone(elem);
  _elem.uuid = createUUID();
  if (index >= 0) {
    core.$data.elements.splice(index, 0, _elem);
    core.$emitChangeData();
    core.$draw();
    return _elem.uuid;
  }
  return null;
}

export function insertElementAfter(
  core: Core,
  elem: DataElementBase<keyof DataElemDesc>,
  beforeUUID: string
) {
  const index = core.getEngine().helper.getElementIndexByUUID(beforeUUID);
  if (index !== null) {
    return core.insertElementAfterIndex(elem, index);
  }
  return null;
}

export function insertElementAfterIndex(
  core: Core,
  elem: DataElementBase<keyof DataElemDesc>,
  index: number
) {
  const _elem = deepClone(elem);
  _elem.uuid = createUUID();
  if (index >= 0) {
    core.$data.elements.splice(index + 1, 0, _elem);
    core.$emitChangeData();
    core.$draw();
    return _elem.uuid;
  }
  return null;
}
