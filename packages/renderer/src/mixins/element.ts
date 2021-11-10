import {
  TypeElement, TypeElemDesc, TypeElementBase,
}  from '@idraw/types';
import util from '@idraw/util';
import {
  _board, _data, _opts, _config, _renderer, _element, _helper,
  _tempData, _draw, _coreEvent, _emitChangeScreen, _emitChangeData,
} from './../names';
import { diffElementResourceChange } from './../lib/diff';
import Core from './../index';
import { Mode } from './../constant/static';

// const { time } = util;
const { deepClone } = util.data;
const { createUUID } = util.uuid;

export function getSelectedElements(core: Core): TypeElement<keyof TypeElemDesc>[] {
  const elems: TypeElement<keyof TypeElemDesc>[] = [];
  let list: string[] = [];
  const uuid = core[_tempData].get('selectedUUID');
  if (typeof uuid === 'string' && uuid) {
    list.push(uuid);
  } else {
    list = core[_tempData].get('selectedUUIDList');
  }
  list.forEach((uuid) => {
    const index = core[_helper].getElementIndexByUUID(uuid);
    if (index !== null && index >= 0) {
      const elem = core[_data]?.elements[index];
      if (elem) elems.push(elem);
    }
  });
  return deepClone(elems);
}

export function getElement(core: Core, uuid: string): TypeElement<keyof TypeElemDesc>|null {
  let elem: TypeElement<keyof TypeElemDesc>|null = null;
  const index = core[_helper].getElementIndexByUUID(uuid);
  if (index !== null && core[_data].elements[index]) {
    elem = deepClone(core[_data].elements[index]);
  }
  return elem;
}

export function getElementByIndex(core: Core, index: number): TypeElement<keyof TypeElemDesc>|null {
  let elem: TypeElement<keyof TypeElemDesc>|null = null;
  if (index >=0  && core[_data].elements[index]) {
    elem = deepClone(core[_data].elements[index]);
  }
  return elem;
}

export function updateElement(core: Core, elem: TypeElement<keyof TypeElemDesc>) {
  const _elem  = deepClone(elem) as TypeElement<keyof TypeElemDesc>;
  const data = core[_data];
  const resourceChangeUUIDs: string[] = [];
  for (let i = 0; i < data.elements.length; i++) {
    if (_elem.uuid === data.elements[i]?.uuid) {
      const result = diffElementResourceChange(data.elements[i], _elem);
      if (typeof result === 'string') {
        resourceChangeUUIDs.push(result);
      }
      data.elements[i] = _elem;
      break;
    }
  }
  core[_emitChangeData]();
  core[_draw]({ resourceChangeUUIDs });
}

export function selectElementByIndex(core: Core, index: number, opts?: { useMode?: boolean }): void {
  if (core[_tempData].get('onlyRender') === true) return;
  if (core[_data].elements[index]) {
    const uuid = core[_data].elements[index].uuid;
    if (opts?.useMode === true) {
      core[_tempData].set('mode', Mode.SELECT_ELEMENT);
    } else {
      core[_tempData].set('mode', Mode.NULL);
    }
    if (typeof uuid === 'string') {
      core[_tempData].set('selectedUUID', uuid);
      core[_tempData].set('selectedUUIDList', []);
    }
    core[_draw]();
  }
}


export function selectElement(core: Core, uuid: string, opts?: { useMode?: boolean }): void {
  if (core[_tempData].get('onlyRender') === true) return;
  const index = core[_helper].getElementIndexByUUID(uuid);
  if (typeof index === 'number' && index >= 0) {
    core.selectElementByIndex(index, opts);
  }
}

export function moveUpElement(core: Core, uuid: string): void {
  // if (this[_onlyRender] === true) return;
  const index = core[_helper].getElementIndexByUUID(uuid);
  if (typeof index === 'number' && index >= 0 && index < core[_data].elements.length - 1) {
    const temp = core[_data].elements[index];
    core[_data].elements[index] = core[_data].elements[index + 1];
    core[_data].elements[index + 1] = temp;
  }
  core[_emitChangeData]();
  core[_draw]();
}

export function moveDownElement(core: Core, uuid: string): void {
  // if (this[_onlyRender] === true) return;
  const index = core[_helper].getElementIndexByUUID(uuid);
  if (typeof index === 'number' && index > 0 && index < core[_data].elements.length) {
    const temp = core[_data].elements[index];
    core[_data].elements[index] = core[_data].elements[index - 1];
    core[_data].elements[index - 1] = temp;
  }
  core[_emitChangeData]();
  core[_draw]();
}


export function addElement(core: Core, elem: TypeElementBase<keyof TypeElemDesc>): string | null {
  // if (this[_onlyRender] === true) return null;
  const _elem = deepClone(elem);
  _elem.uuid = createUUID();
  core[_data].elements.push(_elem);
  core[_emitChangeData]();
  core[_draw]();
  return _elem.uuid;
}

export function deleteElement(core: Core, uuid: string) {
  // if (this[_onlyRender] === true) return;
  const index = core[_element].getElementIndex(core[_data], uuid);
  if (index >= 0) {
    core[_data].elements.splice(index, 1);
    core[_emitChangeData]();
    core[_draw]();
  }
}

export function insertElementBefore(core: Core, elem: TypeElementBase<keyof TypeElemDesc>, beforeUUID: string) {
  const index = core[_helper].getElementIndexByUUID(beforeUUID);
  if (index !== null) {
    return core.insertElementBeforeIndex(elem, index);
  }
  return null;
}


export function insertElementBeforeIndex(core: Core, elem: TypeElementBase<keyof TypeElemDesc>, index: number) {
  const _elem = deepClone(elem);
  _elem.uuid = createUUID();
  if (index >= 0) {
    core[_data].elements.splice(index, 0, _elem);
    core[_emitChangeData]();
    core[_draw]();
    return _elem.uuid;
  }
  return null;
}


export function insertElementAfter(core: Core, elem: TypeElementBase<keyof TypeElemDesc>, beforeUUID: string) {
  const index = core[_helper].getElementIndexByUUID(beforeUUID);
  if (index !== null) {
    return core.insertElementAfterIndex(elem, index);
  }
  return null;
}

export function insertElementAfterIndex(core: Core, elem: TypeElementBase<keyof TypeElemDesc>, index: number) {
  const _elem = deepClone(elem);
  _elem.uuid = createUUID();
  if (index >= 0) {
    core[_data].elements.splice(index + 1, 0, _elem);
    core[_emitChangeData]();
    core[_draw]();
    return _elem.uuid;
  }
  return null;
}