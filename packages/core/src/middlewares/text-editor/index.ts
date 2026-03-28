import type {
  Middleware,
  CoreEventMap,
  StrictMaterial,
  MaterialPosition,
  MiddlewareTextEditorStyles,
  MiddlewareTextEditorConfig,
} from '@idraw/types';
import {
  updateMaterialInList,
  getGroupQueueByMaterialPosition,
  getMaterialAndGroupQueueFromList,
  addClassName,
  removeClassName,
  createHTMLElement,
  setHTMLCSSProps,
} from '@idraw/util';
import { coreEventKeys } from '../../static';
import { initStyles, destroyStyles, resetTextArea } from './dom';
import { classNameMap, getRootClassName, defaultStyles, getMiddlewareTextEditorStyles } from './static';
import type { TextEditEvent, InnerOptions, ExtendEventMap } from './types';
import { triggerChangeEvent } from '../common';

export { getMiddlewareTextEditorStyles };

export const MiddlewareTextEditor: Middleware<
  ExtendEventMap,
  CoreEventMap & ExtendEventMap,
  MiddlewareTextEditorConfig
> = (options, config) => {
  const { eventHub, boardContent, viewer, sharer, calculator } = options;
  const canvas = boardContent.boardContext.canvas;
  const container = options.container || document.body;

  const innerConfig = { ...defaultStyles, ...config };

  const styles: MiddlewareTextEditorStyles = getMiddlewareTextEditorStyles(innerConfig);

  let activeMtrl: StrictMaterial<'text'> | null = null;
  let activePosition: MaterialPosition = [];
  let originText: string = '';
  let isShow: boolean | null = false;

  const id = `idraw-middleware-text-editor-${Math.random().toString(26).substring(2)}`;
  const rootClassName = getRootClassName();

  let textarea: HTMLDivElement | null = null;
  let canvasWrapper: HTMLDivElement | null = null;
  let root: HTMLDivElement | null = null;

  const initDOM = () => {
    if (isShow === true) {
      return;
    }
    textarea = createHTMLElement('div', {
      className: classNameMap.textarea,
      contenteditable: 'true',
    });
    canvasWrapper = createHTMLElement(
      'div',
      {
        className: classNameMap.canvasWrapper,
      },
      [textarea]
    );
    root = createHTMLElement(
      'div',
      {
        id,
        className: rootClassName,
      },
      [canvasWrapper]
    );
    container.appendChild(root);
  };

  const destroyDOM = () => {
    root?.remove();
  };

  const showTextArea = (e: InnerOptions) => {
    if (!root || !textarea) {
      return;
    }
    resetCanvasWrapper();
    resetTextArea(textarea, canvasWrapper, e);
    removeClassName(root, [classNameMap.hide]);
    originText = '';
    isShow = true;
    // moveCursorToEnd(textarea);
    textarea.focus();
    if (activeMtrl?.id) {
      sharer.setActiveOverrideMaterialMap({
        [activeMtrl.id]: {
          operations: { invisible: true },
        },
      });
      originText = activeMtrl.text || '';
      viewer.drawFrame();
    }
  };

  const hideTextArea = () => {
    if (activeMtrl?.id) {
      const map = sharer.getActiveOverrideMaterialMap();
      if (map) {
        delete map[activeMtrl.id];
      }
      sharer.setActiveOverrideMaterialMap(map);
      viewer.drawFrame();
    }
    if (root) {
      addClassName(root, [classNameMap.hide]);
    }

    activeMtrl = null;
    activePosition = [];
    isShow = false;
    destroyDOM();
  };

  const getCanvasRect = () => {
    const clientRect = canvas.getBoundingClientRect() as DOMRect;
    const { left, top, width, height } = clientRect;
    return { left, top, width, height };
  };

  const resetCanvasWrapper = () => {
    if (!canvasWrapper) {
      return;
    }
    const { left, top, width, height } = getCanvasRect();
    setHTMLCSSProps(canvasWrapper, {
      position: 'absolute',
      overflow: 'hidden',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
  };

  const maskClickEvent = () => {
    hideTextArea();
  };

  const textareaDoubleClickEvent = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    window?.getSelection()?.removeAllRanges();
  };
  const textareaSelectStartEvent = (e: any) => {
    if (e.attributes === 2) {
      // attributes=2 double click
      e.preventDefault();
    }
  };

  const textareaInputEvent = () => {
    if (!textarea) {
      return;
    }
    if (activeMtrl && activePosition) {
      // activeMtrl.text = (e.target as any).value || '';
      activeMtrl.text = textarea.innerText || '';
      eventHub.trigger(coreEventKeys.TEXT_CHANGE, {
        material: {
          id: activeMtrl.id,
          attributes: {
            text: activeMtrl.text,
          },
        },
        position: [...(activePosition || [])],
      });
      const virtualItem = calculator.getVirtualItem(activeMtrl.id);
      const data = sharer.getActiveStorage('data') || { materials: [] };
      calculator.modifyVirtualAttributes(activeMtrl, {
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo(),
        groupQueue: getGroupQueueByMaterialPosition(data.materials, virtualItem?.position || []) || [],
      });
      viewer.drawFrame();
    }
  };

  const textareaBlurEvent = () => {
    if (activeMtrl && activePosition) {
      activeMtrl.text = textarea?.innerText || '';
      eventHub.trigger(coreEventKeys.TEXT_CHANGE, {
        material: {
          id: activeMtrl.id,
          attributes: {
            text: activeMtrl.text,
          },
        },
        position: [...activePosition],
      });

      const data = sharer.getActiveStorage('data') || { materials: [] };
      const updateContent = {
        text: activeMtrl.text,
      };
      updateMaterialInList(activeMtrl.id, updateContent, data.materials);

      triggerChangeEvent(eventHub, {
        selectedMaterials: [
          {
            ...activeMtrl,
            ...activeMtrl,
            ...updateContent,
          },
        ],
        data,
        type: 'modifyMaterial',
        modifyRecord: {
          type: 'modifyMaterial',
          time: Date.now(),
          content: {
            method: 'modifyMaterial',
            id: activeMtrl.id as string,
            before: {
              'attributes.text': originText,
            },
            after: {
              'attributes.text': activeMtrl.text,
            },
          },
        },
      });
      const virtualItem = calculator.getVirtualItem(activeMtrl.id);
      calculator.modifyVirtualAttributes(activeMtrl, {
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo(),
        groupQueue: getGroupQueueByMaterialPosition(data.materials, virtualItem?.position || []) || [],
      });
      viewer.drawFrame();
    }
    hideTextArea();
  };

  const preventDefaultEvent = (e: KeyboardEvent | MouseEvent) => {
    e.stopPropagation();
  };

  const textareaWheelEvent = (e: WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const onEvents = () => {
    root?.addEventListener('click', maskClickEvent);
    textarea?.addEventListener('mousedown', preventDefaultEvent);
    textarea?.addEventListener('mouseover', preventDefaultEvent);
    textarea?.addEventListener('mouseenter', preventDefaultEvent);
    textarea?.addEventListener('mouseleave', preventDefaultEvent);
    textarea?.addEventListener('dblclick', textareaDoubleClickEvent);
    textarea?.addEventListener('selectstart', textareaSelectStartEvent);
    textarea?.addEventListener('click', preventDefaultEvent);
    textarea?.addEventListener('input', textareaInputEvent);
    textarea?.addEventListener('blur', textareaBlurEvent);
    textarea?.addEventListener('keydown', preventDefaultEvent);
    textarea?.addEventListener('keypress', preventDefaultEvent);
    textarea?.addEventListener('keyup', preventDefaultEvent);
    textarea?.addEventListener('wheel', textareaWheelEvent);
  };

  const offEvents = () => {
    root?.removeEventListener('click', maskClickEvent);
    textarea?.removeEventListener('mousedown', preventDefaultEvent);
    textarea?.removeEventListener('mouseover', preventDefaultEvent);
    textarea?.removeEventListener('mouseenter', preventDefaultEvent);
    textarea?.removeEventListener('mouseleave', preventDefaultEvent);
    textarea?.removeEventListener('dblclick', textareaDoubleClickEvent);
    textarea?.removeEventListener('selectstart', textareaSelectStartEvent);
    textarea?.removeEventListener('click', preventDefaultEvent);
    textarea?.removeEventListener('input', textareaInputEvent);
    textarea?.removeEventListener('blur', textareaBlurEvent);
    textarea?.removeEventListener('keydown', preventDefaultEvent);
    textarea?.removeEventListener('keypress', preventDefaultEvent);
    textarea?.removeEventListener('keyup', preventDefaultEvent);
    textarea?.removeEventListener('wheel', textareaWheelEvent);
  };

  const textEditCallback = (e: TextEditEvent) => {
    const { id } = e;
    if (!(typeof id === 'string' && id)) {
      return;
    }
    initDOM();
    onEvents();

    const data = sharer.getActiveStorage('data');
    const { material, groupQueue, position } = getMaterialAndGroupQueueFromList(id, data.materials);

    if (material?.type === 'text') {
      activeMtrl = material as StrictMaterial<'text'>;
      activePosition = position;

      showTextArea({
        material: activeMtrl,
        groupQueue,
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        styles,
      });
    }
  };

  const preventAction = () => {
    if (isShow === true) {
      return false;
    }
  };

  return {
    name: '@middleware/text-editor',
    use() {
      initStyles(rootClassName, styles);
      eventHub.on(coreEventKeys.TEXT_EDIT, textEditCallback);
    },
    disuse() {
      destroyStyles(rootClassName);
      eventHub.off(coreEventKeys.TEXT_EDIT, textEditCallback);
      offEvents();
      destroyDOM();

      textarea = null as any;
      canvasWrapper = null as any;
      root = null as any;

      activeMtrl = null;
      activePosition = null as any;
      originText = null as any;
    },

    hover: preventAction,
    pointStart: preventAction,
    pointMove: preventAction,
    pointEnd: preventAction,
    pointLeave: preventAction,
    doubleClick: preventAction,
    contextMenu: preventAction,
    wheel: preventAction,
    wheelScale: preventAction,
    scrollX: preventAction,
    scrollY: preventAction,
    resize: preventAction,
  };
};
