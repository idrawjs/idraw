import {
  TypeElement, TypeElemDesc,
}  from '@idraw/types';
import util from '@idraw/util';
import {
  _board, _data, _opts, _config, _renderer, _element, _helper, _hasInited,
  _mode, _tempData, _prevPoint, _draw, _selectedDotDirection, _coreEvent, _mapper, _initEvent,
  _handlePoint, _handleClick, _handleDoubleClick, _handleMoveStart, _handleMove, 
  _handleMoveEnd, _handleHover, _handleLeave, _dragElements, _transfromElement, 
  _emitChangeScreen, _emitChangeData, _onlyRender, _cursorStatus,
} from './../names';
import { diffElementResourceChange } from './../lib/diff';
import Core from './../index';

// const { time } = util;
const { deepClone } = util.data;

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