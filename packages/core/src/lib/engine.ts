import {
  TypePoint,
  TypeHelperWrapperControllerDirection,
  InterfaceHelperPlugin,
  TypeConfigStrict,
  TypeData,
  TypeHelperConfig
} from '@idraw/types';
import { deepClone, throttle } from '@idraw/util';
import Board from '@idraw/board';
import { Mode, CursorStatus } from './../constant/static';
import { TempData } from './engine-temp';
import { Helper } from './helper';
import { Mapper } from './mapper';
import { Element } from './element';
import { CoreEvent } from './core-event';

type Options = {
  coreEvent: CoreEvent;
  board: Board;
  element: Element;
  config: TypeConfigStrict;
  drawFeekback: () => void;
  getDataFeekback: () => TypeData;
  selectElementByIndex: (index: number, opts?: { useMode?: boolean }) => void;
  emitChangeScreen: () => void;
  emitChangeData: () => void;
};

export class Engine {
  private _plugins: InterfaceHelperPlugin[] = [];
  private _opts: Options;
  private _mapper: Mapper;

  public temp: TempData;
  public helper: Helper;

  constructor(opts: Options) {
    const { board, config, element } = opts;
    const helper = new Helper(board, config);
    this._opts = opts;
    this.temp = new TempData();
    this.helper = helper;
    this._mapper = new Mapper({ board, helper, element });
  }

  addPlugin(plugin: InterfaceHelperPlugin) {
    this._plugins.push(plugin);
  }

  getHelperConfig(): TypeHelperConfig {
    return this.helper.getConfig();
  }

  updateHelperConfig(opts: {
    width: number;
    height: number;
    devicePixelRatio: number;
  }) {
    const { board, getDataFeekback, config } = this._opts;
    const data = getDataFeekback();
    const transform = board.getTransform();
    this.helper.updateConfig(data, {
      width: opts.width,
      height: opts.height,
      devicePixelRatio: opts.devicePixelRatio,
      canScroll: config?.scrollWrapper?.use === true,
      selectedUUID: this.temp.get('selectedUUID'),
      selectedUUIDList: this.temp.get('selectedUUIDList'),
      scale: transform.scale,
      scrollX: transform.scrollX,
      scrollY: transform.scrollY
    });
  }

  init() {
    this._initEvent();
  }

  private _initEvent(): void {
    if (this.temp.get('hasInited') === true) {
      return;
    }
    const { board } = this._opts;

    board.on('hover', throttle(this._handleHover.bind(this), 32));
    board.on('leave', throttle(this._handleLeave.bind(this), 32));
    board.on('point', throttle(this._handleClick.bind(this), 16));
    board.on('doubleClick', this._handleDoubleClick.bind(this));
    board.on('point', this._handlePoint.bind(this));
    board.on('moveStart', this._handleMoveStart.bind(this));
    board.on('move', throttle(this._handleMove.bind(this), 16));
    board.on('moveEnd', this._handleMoveEnd.bind(this));
  }

  private _handleDoubleClick(point: TypePoint) {
    const { element, getDataFeekback, drawFeekback, coreEvent } = this._opts;
    const data = getDataFeekback();
    const [index, uuid] = element.isPointInElement(point, data);
    if (index >= 0 && uuid) {
      const elem = deepClone(data.elements?.[index]);
      if (elem?.operation?.invisible !== true) {
        coreEvent.trigger('screenDoubleClickElement', {
          index,
          uuid,
          element: deepClone(data.elements?.[index])
        });
      }
    }
    drawFeekback();
  }

  _handlePoint(point: TypePoint): void {
    if (!this._mapper.isEffectivePoint(point)) {
      return;
    }
    const {
      element,
      getDataFeekback,
      selectElementByIndex,
      coreEvent,
      emitChangeScreen,
      drawFeekback
    } = this._opts;
    const helper = this.helper;
    const data = getDataFeekback();
    if (helper.isPointInElementList(point, data)) {
      // Coontroll Element-List
      this.temp.set('mode', Mode.SELECT_ELEMENT_LIST);
    } else {
      const { uuid, selectedControllerDirection } =
        helper.isPointInElementWrapperController(point, data);
      if (uuid && selectedControllerDirection) {
        // Controll Element-Wrapper
        this.temp.set('mode', Mode.SELECT_ELEMENT_WRAPPER_CONTROLLER);
        this.temp.set(
          'selectedControllerDirection',
          selectedControllerDirection
        );
        this.temp.set('selectedUUID', uuid);
      } else {
        const [index, uuid] = element.isPointInElement(point, data);
        if (index >= 0 && data.elements[index]?.operation?.invisible !== true) {
          // Controll Element
          selectElementByIndex(index, { useMode: true });
          if (
            typeof uuid === 'string' &&
            coreEvent.has('screenSelectElement')
          ) {
            coreEvent.trigger('screenSelectElement', {
              index,
              uuid,
              element: deepClone(data.elements?.[index])
            });
            emitChangeScreen();
          }
          this.temp.set('mode', Mode.SELECT_ELEMENT);
        } else {
          // Controll Area
          this.temp.set('selectedUUIDList', []);
          this.temp.set('selectedUUID', null);
          this.temp.set('mode', Mode.SELECT_AREA);
        }
      }
    }
    drawFeekback();
  }

  private _handleClick(point: TypePoint): void {
    const { element, getDataFeekback, coreEvent, drawFeekback } = this._opts;
    const data = getDataFeekback();
    const [index, uuid] = element.isPointInElement(point, data);
    if (index >= 0 && uuid) {
      coreEvent.trigger('screenClickElement', {
        index,
        uuid,
        element: deepClone(data.elements?.[index])
      });
    }
    drawFeekback();
  }

  private _handleMoveStart(point: TypePoint): void {
    const { element, getDataFeekback, coreEvent } = this._opts;
    const data = getDataFeekback();
    const helper = this.helper;

    this.temp.set('prevPoint', point);
    const uuid = this.temp.get('selectedUUID');

    if (this.temp.get('mode') === Mode.SELECT_ELEMENT_LIST) {
      // TODO
    } else if (this.temp.get('mode') === Mode.SELECT_ELEMENT) {
      if (typeof uuid === 'string' && coreEvent.has('screenMoveElementStart')) {
        coreEvent.trigger('screenMoveElementStart', {
          index: element.getElementIndex(data, uuid),
          uuid,
          x: point.x,
          y: point.y
        });
      }
    } else if (this.temp.get('mode') === Mode.SELECT_AREA) {
      helper.startSelectArea(point);
    }
  }

  private _handleMove(point: TypePoint): void {
    const { drawFeekback } = this._opts;
    const helper = this.helper;
    if (this.temp.get('mode') === Mode.SELECT_ELEMENT_LIST) {
      this.temp.set('hasChangedElement', true);
      this._dragElements(
        this.temp.get('selectedUUIDList'),
        point,
        this.temp.get('prevPoint')
      );
      drawFeekback();
      this.temp.set('cursorStatus', CursorStatus.DRAGGING);
    } else if (typeof this.temp.get('selectedUUID') === 'string') {
      if (this.temp.get('mode') === Mode.SELECT_ELEMENT) {
        this.temp.set('hasChangedElement', true);
        this._dragElements(
          [this.temp.get('selectedUUID') as string],
          point,
          this.temp.get('prevPoint')
        );
        drawFeekback();
        this.temp.set('cursorStatus', CursorStatus.DRAGGING);
      } else if (
        this.temp.get('mode') === Mode.SELECT_ELEMENT_WRAPPER_CONTROLLER &&
        this.temp.get('selectedControllerDirection')
      ) {
        this._transfromElement(
          this.temp.get('selectedUUID') as string,
          point,
          this.temp.get('prevPoint'),
          this.temp.get(
            'selectedControllerDirection'
          ) as TypeHelperWrapperControllerDirection
        );
        this.temp.set('cursorStatus', CursorStatus.DRAGGING);
      }
    } else if (this.temp.get('mode') === Mode.SELECT_AREA) {
      helper.changeSelectArea(point);
      drawFeekback();
    }
    this.temp.set('prevPoint', point);
  }

  private _dragElements(
    uuids: string[],
    point: TypePoint,
    prevPoint: TypePoint | null
  ): void {
    if (!prevPoint) {
      return;
    }
    const { board, element, getDataFeekback, drawFeekback } = this._opts;
    const data = getDataFeekback();
    const helper = this.helper;
    uuids.forEach((uuid) => {
      const idx = helper.getElementIndexByUUID(uuid);
      if (idx === null) return;
      const elem = data.elements[idx];
      if (
        elem?.operation?.lock !== true &&
        elem?.operation?.invisible !== true
      ) {
        element.dragElement(
          data,
          uuid,
          point,
          prevPoint,
          board.getContext().getTransform().scale
        );
      }
    });
    drawFeekback();
  }

  private _transfromElement(
    uuid: string,
    point: TypePoint,
    prevPoint: TypePoint | null,
    direction: TypeHelperWrapperControllerDirection
  ): null | { width: number; height: number; angle: number } {
    if (!prevPoint) {
      return null;
    }
    const { board, element, getDataFeekback, drawFeekback } = this._opts;
    const data = getDataFeekback();
    const result = element.transformElement(
      data,
      uuid,
      point,
      prevPoint,
      board.getContext().getTransform().scale,
      direction
    );
    drawFeekback();
    return result;
  }

  private _handleMoveEnd(point: TypePoint): void {
    const {
      element,
      getDataFeekback,
      coreEvent,
      drawFeekback,
      emitChangeData
    } = this._opts;
    const data = getDataFeekback();
    const helper = this.helper;

    const uuid = this.temp.get('selectedUUID');
    if (typeof uuid === 'string') {
      const index = element.getElementIndex(data, uuid);
      const elem = data.elements[index];
      if (elem) {
        if (coreEvent.has('screenMoveElementEnd')) {
          coreEvent.trigger('screenMoveElementEnd', {
            index,
            uuid,
            x: point.x,
            y: point.y
          });
        }
        if (coreEvent.has('screenChangeElement')) {
          coreEvent.trigger('screenChangeElement', {
            index,
            uuid,
            width: elem.w,
            height: elem.h,
            angle: elem.angle || 0
          });
        }
      }
    } else if (this.temp.get('mode') === Mode.SELECT_AREA) {
      const uuids = helper.calcSelectedElements(data);
      if (uuids.length > 0) {
        this.temp.set('selectedUUIDList', uuids);
        this.temp.set('selectedUUID', null);
      } else {
        this.temp.set('mode', Mode.NULL);
      }
      helper.clearSelectedArea();
      drawFeekback();
    }

    if (this.temp.get('mode') !== Mode.SELECT_ELEMENT) {
      this.temp.set('selectedUUID', null);
    }
    this.temp.set('cursorStatus', CursorStatus.NULL);
    this.temp.set('mode', Mode.NULL);

    if (this.temp.get('hasChangedElement') === true) {
      emitChangeData();
      this.temp.set('hasChangedElement', false);
    }
  }

  private _handleHover(point: TypePoint): void {
    let isMouseOverElement = false;
    const { board, getDataFeekback, coreEvent } = this._opts;
    const data = getDataFeekback();
    const helper = this.helper;
    const mapper = this._mapper;

    if (this.temp.get('mode') === Mode.SELECT_AREA) {
      board.resetCursor();
    } else if (this.temp.get('cursorStatus') === CursorStatus.NULL) {
      const { cursor, elementUUID } = mapper.judgePointCursor(point, data);
      board.setCursor(cursor);
      if (elementUUID) {
        const index: number | null = helper.getElementIndexByUUID(elementUUID);
        if (index !== null && index >= 0) {
          const elem = data.elements[index];
          if (
            elem?.operation?.lock === true ||
            elem?.operation?.invisible === true
          ) {
            board.resetCursor();
            return;
          }
          if (this.temp.get('hoverUUID') !== elem.uuid) {
            const preIndex = helper.getElementIndexByUUID(
              this.temp.get('hoverUUID') || ''
            );
            if (preIndex !== null && data.elements[preIndex]) {
              coreEvent.trigger('mouseLeaveElement', {
                uuid: this.temp.get('hoverUUID'),
                index: preIndex,
                element: data.elements[preIndex]
              });
            }
          }
          if (elem) {
            coreEvent.trigger('mouseOverElement', {
              uuid: elem.uuid,
              index,
              element: elem
            });
            this.temp.set('hoverUUID', elem.uuid);
            isMouseOverElement = true;
          }
        }
      }
    }
    if (isMouseOverElement !== true && this.temp.get('hoverUUID') !== null) {
      const uuid = this.temp.get('hoverUUID');
      const index: number | null = helper.getElementIndexByUUID(uuid || '');
      if (index !== null)
        coreEvent.trigger('mouseLeaveElement', {
          uuid,
          index,
          element: data.elements[index]
        });
      this.temp.set('hoverUUID', null);
    }
    if (coreEvent.has('mouseOverScreen'))
      coreEvent.trigger('mouseOverScreen', point);
  }

  private _handleLeave(): void {
    const { coreEvent } = this._opts;
    if (coreEvent.has('mouseLeaveScreen')) {
      coreEvent.trigger('mouseLeaveScreen', undefined);
    }
  }
}
