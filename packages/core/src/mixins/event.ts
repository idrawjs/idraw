import { TypePoint, TypeHelperWrapperDotDirection } from '@idraw/types';
import util from '@idraw/util';
import Core from './../index';
import {
  _board, _data, _opts, _config, _renderer, _element, _helper,
  _mode, _tempData, _draw, _coreEvent, _mapper,
  _emitChangeScreen, _emitChangeData, _onlyRender, _cursorStatus,
} from './../names';
import { Mode, CursorStatus } from './../constant/static';

const { time } = util;
const { deepClone } = util.data;

export function initEvent(core: Core): void {

  if (core[_tempData].get('hasInited') === true) {
    return;
  }
  
  core[_board].on('hover', time.throttle(handleHover(core), 32));
  core[_board].on('leave', time.throttle(handleLeave(core), 32));
  core[_board].on('point', time.throttle(handleClick(core), 16));
  core[_board].on('doubleClick', handleDoubleClick(core));
  if (core[_onlyRender] === true) {
    return;
  }
  core[_board].on('point', handlePoint(core));
  core[_board].on('moveStart', handleMoveStart(core));
  core[_board].on('move', time.throttle(handleMove(core), 16));
  core[_board].on('moveEnd', handleMoveEnd(core));

  core[_tempData].set('hasInited', true);
}


function handleDoubleClick(core: Core) {
  return function ( point: TypePoint) {
    const [index, uuid] = core[_element].isPointInElement(point, core[_data]);
    if (index >= 0 && uuid) {
      core[_coreEvent].trigger(
        'screenDoubleClickElement', 
        { index, uuid, element: deepClone(core[_data].elements?.[index])}
      );
    }
    core[_draw]();
  }
}


function handlePoint(core: Core) {
  return function(point: TypePoint): void {
    if (!core[_mapper].isEffectivePoint(point)) {
      return;
    }
    if (core[_helper].isPointInElementList(point, core[_data])) {
      // Coontroll Element-List
      core[_mode] = Mode.SELECT_ELEMENT_LIST;
    } else {
      const [uuid, direction] = core[_helper].isPointInElementWrapperDot(point);
      if (uuid && direction) {
        // Controll Element-Wrapper
        core[_mode] = Mode.SELECT_ELEMENT_WRAPPER_DOT;
        core[_tempData].set('selectedDotDirection', direction);
        core[_tempData].set('selectedUUID', uuid);
      } else {
        const [index, uuid] = core[_element].isPointInElement(point, core[_data]);
        if (index >= 0 && core[_data].elements[index]?.operation?.invisible !== true) {
          // Controll Element
          core.selectElementByIndex(index, { useMode: true });
          if (typeof uuid === 'string' && core[_coreEvent].has('screenSelectElement')) {
            core[_coreEvent].trigger(
              'screenSelectElement', 
              { index, uuid, element: deepClone(core[_data].elements?.[index])}
            );
            core[_emitChangeScreen]();
          }
          core[_mode] = Mode.SELECT_ELEMENT;
        } else {
          // Controll Area
          core[_tempData].set('selectedUUIDList', []);
          core[_mode] = Mode.SELECT_AREA;
        }
      }
    }
    
    core[_draw]();
  }
}


function handleClick(core: Core) {
  return function(point: TypePoint): void {
    console.log('handleClick: point =', point)
    const [index, uuid] = core[_element].isPointInElement(point, core[_data]);
    if (index >= 0 && uuid) {
      core[_coreEvent].trigger(
        'screenClickElement', 
        { index, uuid, element: deepClone(core[_data].elements?.[index])}
      );
    }
    core[_draw]();
  }
}

function handleMoveStart(core: Core) {
  return function(point: TypePoint): void {
    core[_tempData].set('prevPoint', point);
    const uuid = core[_tempData].get('selectedUUID');
  
    if (core[_mode] === Mode.SELECT_ELEMENT_LIST) {
      // TODO
    } else if (core[_mode] === Mode.SELECT_ELEMENT) {
      if (typeof uuid === 'string' && core[_coreEvent].has('screenMoveElementStart')) {
        core[_coreEvent].trigger('screenMoveElementStart', {
          index: core[_element].getElementIndex(core[_data], uuid),
          uuid,
          x: point.x,
          y: point.y
        });
      } 
    } else if (core[_mode] === Mode.SELECT_AREA) {
      core[_helper].startSelectArea(point);
    }
  }
}


function handleMove(core: Core) {
  return function(point: TypePoint): void {
    if (core[_mode] === Mode.SELECT_ELEMENT_LIST) {
      dragElements(core, core[_tempData].get('selectedUUIDList'), point, core[_tempData].get('prevPoint'));
      core[_draw]();
      core[_cursorStatus] = CursorStatus.DRAGGING;
    } else if (typeof core[_tempData].get('selectedUUID') === 'string') {
      if (core[_mode] === Mode.SELECT_ELEMENT) {
        dragElements(core, [core[_tempData].get('selectedUUID') as string], point, core[_tempData].get('prevPoint'));
        core[_draw]();
        core[_cursorStatus] = CursorStatus.DRAGGING;
      } else if (core[_mode] === Mode.SELECT_ELEMENT_WRAPPER_DOT && core[_tempData].get('selectedDotDirection')) {
        transfromElement(core, core[_tempData].get('selectedUUID') as string, point, core[_tempData].get('prevPoint'), core[_tempData].get('selectedDotDirection') as TypeHelperWrapperDotDirection);
        core[_cursorStatus] = CursorStatus.DRAGGING;
      }
    } else if (core[_mode] === Mode.SELECT_AREA) {
      core[_helper].changeSelectArea(point);
      core[_draw]();
    }
    core[_tempData].set('prevPoint', point)
  }
}

function dragElements(core: Core, uuids: string[], point: TypePoint, prevPoint: TypePoint|null): void {
  if (!prevPoint) {
    return;
  }
  uuids.forEach((uuid) => {
    const idx = core[_helper].getElementIndexByUUID(uuid);
    if (idx === null) return;
    const elem = core[_data].elements[idx];
    if (elem?.operation?.lock !== true && elem?.operation?.invisible !== true) {
      core[_element].dragElement(core[_data], uuid, point, prevPoint, core[_board].getContext().getTransform().scale);
    }
  });
  core[_draw]();
}


function handleMoveEnd(core: Core) {
  return function (point: TypePoint): void {
    const uuid = core[_tempData].get('selectedUUID');
    if (typeof uuid === 'string') {
      const index = core[_element].getElementIndex(core[_data], uuid);
      const elem = core[_data].elements[index];
      if (elem) {
        if (core[_coreEvent].has('screenMoveElementEnd')) {
          core[_coreEvent].trigger('screenMoveElementEnd', {
            index,
            uuid,
            x: point.x,
            y: point.y
          });
        }
        if (core[_coreEvent].has('screenChangeElement')) {
          core[_coreEvent].trigger('screenChangeElement', {
            index,
            uuid,
            width: elem.w,
            height: elem.h,
            angle: elem.angle || 0
          });
        }
        core[_emitChangeData]();
      }
    } else if (core[_mode] === Mode.SELECT_AREA) {
      const uuids = core[_helper].calcSelectedElements(core[_data]);
      if (uuids.length > 0) {
        core[_tempData].set('selectedUUIDList', uuids);
        core[_tempData].set('selectedUUID', null);
      } else {
        core[_mode] = Mode.NULL;
      }
      core[_helper].clearSelectedArea();
      core[_draw]();
    }
    
    if (core[_mode] !== Mode.SELECT_ELEMENT) {
      core[_tempData].set('selectedUUID', null);
    }
    core[_cursorStatus] = CursorStatus.NULL;
    core[_mode] = Mode.NULL;
  }
}

function handleHover(core: Core) {
  return function (point: TypePoint): void {
    let isMouseOverElement: boolean = false;
    
    if (core[_mode] === Mode.SELECT_AREA) {
      if (core[_onlyRender] !== true) core[_board].resetCursor();
    } else if (core[_cursorStatus] === CursorStatus.NULL) {
      const { cursor, elementUUID } = core[_mapper].judgePointCursor(point, core[_data]);
      if (core[_onlyRender] !== true) core[_board].setCursor(cursor);
      if (elementUUID) {
        const index: number | null = core[_helper].getElementIndexByUUID(elementUUID);
        if (index !== null && index >= 0) {
          const elem = core[_data].elements[index];
          if (elem?.operation?.lock === true || elem?.operation?.invisible === true) {
            core[_board].resetCursor();
            return;
          }
          if (core[_tempData].get('hoverUUID') !== elem.uuid) {
            const preIndex = core[_helper].getElementIndexByUUID(core[_tempData].get('hoverUUID') || '');
            if (preIndex !== null && core[_data].elements[preIndex]) {
              core[_coreEvent].trigger('mouseLeaveElement', {
                uuid: core[_tempData].get('hoverUUID'),
                index: preIndex,
                element: core[_data].elements[preIndex]
              });
            }
          }
          if (elem) {
            core[_coreEvent].trigger('mouseOverElement', { uuid: elem.uuid, index,  element: elem, });
            core[_tempData].set('hoverUUID', elem.uuid);
            isMouseOverElement = true;
          }
        }
      }
    }
    if (isMouseOverElement !== true && core[_tempData].get('hoverUUID') !== null) {
      const uuid = core[_tempData].get('hoverUUID');
      const index: number | null = core[_helper].getElementIndexByUUID(uuid || '');
      if (index !== null) core[_coreEvent].trigger('mouseLeaveElement', { uuid, index, element: core[_data].elements[index] })
      core[_tempData].set('hoverUUID', null); 
    }
    if (core[_coreEvent].has('mouseOverScreen')) core[_coreEvent].trigger('mouseOverScreen', point);
  }
}

function handleLeave(core: Core) {
  return function(): void {
    if (core[_coreEvent].has('mouseLeaveScreen')) {
      core[_coreEvent].trigger('mouseLeaveScreen', undefined);
    }
  }
}

function transfromElement(
  core: Core,
  uuid: string, point: TypePoint, prevPoint: TypePoint|null, direction: TypeHelperWrapperDotDirection
): null | {
  width: number,
  height: number,
  angle: number,
} {
  if (!prevPoint) {
    return null;
  }
  const result = core[_element].transformElement(core[_data], uuid, point, prevPoint, core[_board].getContext().getTransform().scale, direction);
  core[_draw]();
  return result;
}