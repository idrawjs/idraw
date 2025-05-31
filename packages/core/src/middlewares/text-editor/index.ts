import type { Middleware, CoreEventMap, Element, ElementSize, ViewScaleInfo, ElementPosition } from '@idraw/types';
import { limitAngle, getDefaultElementDetailConfig, enhanceFontFamliy, updateElementInList } from '@idraw/util';
import { coreEventKeys } from '../../config';

type TextEditEvent = {
  element: Element<'text'>;
  position: ElementPosition;
  groupQueue: Element<'group'>[];
  viewScaleInfo: ViewScaleInfo;
};

type TextChangeEvent = {
  element: {
    uuid: string;
    detail: {
      text: string;
    };
  };
  position: ElementPosition;
};

type ExtendEventMap = Record<typeof coreEventKeys.TEXT_EDIT, TextEditEvent> &
  Record<typeof coreEventKeys.TEXT_CHANGE, TextChangeEvent>;

const defaultElementDetail = getDefaultElementDetailConfig();

export const MiddlewareTextEditor: Middleware<ExtendEventMap, CoreEventMap & ExtendEventMap> = (opts) => {
  const { eventHub, boardContent, viewer, sharer, calculator } = opts;
  const canvas = boardContent.boardContext.canvas;
  const container = opts.container || document.body;
  let textarea = document.createElement('div');
  textarea.setAttribute('contenteditable', 'true');
  let canvasWrapper = document.createElement('div');
  let mask = document.createElement('div');
  let activeElem: Element<'text'> | null = null;
  let activePosition: ElementPosition = [];
  let originText: string = '';

  const id = `idraw-middleware-text-editor-${Math.random().toString(26).substring(2)}`;
  mask.setAttribute('id', id);
  canvasWrapper.appendChild(textarea);

  canvasWrapper.style.position = 'absolute';
  mask.appendChild(canvasWrapper);

  mask.style.position = 'fixed';
  mask.style.top = '0';
  mask.style.bottom = '0';
  mask.style.left = '0';
  mask.style.right = '0';
  mask.style.display = 'none';
  container.appendChild(mask);

  const showTextArea = (e: TextEditEvent) => {
    resetCanvasWrapper();
    resetTextArea(e);
    mask.style.display = 'block';
    originText = '';
    if (activeElem?.uuid) {
      sharer.setActiveOverrideElemenentMap({
        [activeElem.uuid]: {
          operations: { invisible: true }
        }
      });
      originText = activeElem.detail.text || '';
      viewer.drawFrame();
    }
  };

  const hideTextArea = () => {
    if (activeElem?.uuid) {
      const map = sharer.getActiveOverrideElemenentMap();
      if (map) {
        delete map[activeElem.uuid];
      }
      sharer.setActiveOverrideElemenentMap(map);
      viewer.drawFrame();
    }

    mask.style.display = 'none';
    activeElem = null;
    activePosition = [];
  };

  const getCanvasRect = () => {
    const clientRect = canvas.getBoundingClientRect() as DOMRect;
    const { left, top, width, height } = clientRect;
    return { left, top, width, height };
  };

  const createBox = (opts: { size: ElementSize; parent: HTMLDivElement }) => {
    const { size, parent } = opts;
    const div = document.createElement('div');
    const { x, y, w, h } = size;
    const angle = limitAngle(size.angle || 0);
    div.style.position = 'absolute';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.width = `${w}px`;
    div.style.height = `${h}px`;
    div.style.transform = `rotate(${angle}deg)`;
    parent.appendChild(div);
    return div;
  };

  const resetTextArea = (e: TextEditEvent) => {
    const { viewScaleInfo, element, groupQueue } = e;
    const { scale, offsetTop, offsetLeft } = viewScaleInfo;

    if (canvasWrapper.children) {
      Array.from(canvasWrapper.children).forEach((child) => {
        child.remove();
      });
    }
    let parent = canvasWrapper;
    for (let i = 0; i < groupQueue.length; i++) {
      const group = groupQueue[i];
      const { x, y, w, h } = group;
      const angle = limitAngle(group.angle || 0);
      const size = {
        x: x * scale,
        y: y * scale,
        w: w * scale,
        h: h * scale,
        angle
      };
      if (i === 0) {
        size.x += offsetLeft;
        size.y += offsetTop;
      }
      parent = createBox({ size, parent });
    }

    const detail = {
      ...defaultElementDetail,
      ...element.detail
    };

    let elemX = element.x * scale + offsetLeft;
    let elemY = element.y * scale + offsetTop;
    let elemW = element.w * scale;
    let elemH = element.h * scale;

    if (groupQueue.length > 0) {
      elemX = element.x * scale;
      elemY = element.y * scale;
      elemW = element.w * scale;
      elemH = element.h * scale;
    }

    let justifyContent: ElementCSSInlineStyle['style']['justifyContent'] = 'center';
    let alignItems = 'center';
    if (detail.textAlign === 'left') {
      justifyContent = 'start';
    } else if (detail.textAlign === 'right') {
      justifyContent = 'end';
    }

    if (detail.verticalAlign === 'top') {
      alignItems = 'start';
    } else if (detail.verticalAlign === 'bottom') {
      alignItems = 'end';
    }

    textarea.style.display = 'inline-flex';
    textarea.style.justifyContent = justifyContent;
    textarea.style.alignItems = alignItems;

    textarea.style.position = 'absolute';
    textarea.style.left = `${elemX - 1}px`;
    textarea.style.top = `${elemY - 1}px`;
    textarea.style.width = `${elemW + 2}px`;
    textarea.style.height = `${elemH + 2}px`;
    textarea.style.transform = `rotate(${limitAngle(element.angle || 0)}deg)`;
    // textarea.style.border = 'none';
    textarea.style.boxSizing = 'border-box';
    textarea.style.border = '1px solid #1973ba';
    textarea.style.resize = 'none';
    textarea.style.overflow = 'hidden';
    textarea.style.wordBreak = 'break-all';
    textarea.style.borderRadius = `${(typeof detail.borderRadius === 'number' ? detail.borderRadius : 0) * scale}px`;
    textarea.style.background = `${detail.background || 'transparent'}`;
    textarea.style.color = `${detail.color || '#333333'}`;
    textarea.style.fontSize = `${detail.fontSize * scale}px`;
    textarea.style.lineHeight = `${(detail.lineHeight || detail.fontSize) * scale}px`;
    textarea.style.fontFamily = enhanceFontFamliy(detail.fontFamily);
    textarea.style.fontWeight = `${detail.fontWeight}`;
    textarea.style.padding = '0';
    textarea.style.margin = '0';
    textarea.style.outline = 'none';

    // textarea.value = detail.text || '';
    textarea.innerText = detail.text || '';
    parent.appendChild(textarea);
  };

  const resetCanvasWrapper = () => {
    const { left, top, width, height } = getCanvasRect();
    canvasWrapper.style.position = 'absolute';
    canvasWrapper.style.overflow = 'hidden';
    canvasWrapper.style.top = `${top}px`;
    canvasWrapper.style.left = `${left}px`;
    canvasWrapper.style.width = `${width}px`;
    canvasWrapper.style.height = `${height}px`;
    // canvasWrapper.style.background = '#000000';
  };

  const maskClickEvent = () => {
    hideTextArea();
  };

  const textareaClickEvent = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const textareaInputEvent = () => {
    if (activeElem && activePosition) {
      // activeElem.detail.text = (e.target as any).value || '';
      activeElem.detail.text = textarea.innerText || '';
      eventHub.trigger(coreEventKeys.TEXT_CHANGE, {
        element: {
          uuid: activeElem.uuid,
          detail: {
            text: activeElem.detail.text
          }
        },
        position: [...(activePosition || [])]
      });
      calculator.modifyText(activeElem);
      viewer.drawFrame();
    }
  };

  const textareaBlurEvent = () => {
    if (activeElem && activePosition) {
      activeElem.detail.text = textarea.innerText || '';
      eventHub.trigger(coreEventKeys.TEXT_CHANGE, {
        element: {
          uuid: activeElem.uuid,
          detail: {
            text: activeElem.detail.text
          }
        },
        position: [...activePosition]
      });

      const data = sharer.getActiveStorage('data') || { elements: [] };
      const updateContent = {
        detail: {
          text: activeElem.detail.text
        }
      };
      updateElementInList(activeElem.uuid, updateContent, data.elements);

      eventHub.trigger(coreEventKeys.CHANGE, {
        selectedElements: [
          {
            ...activeElem,
            detail: {
              ...activeElem.detail,
              ...updateContent.detail
            }
          }
        ],
        data,
        type: 'modifyElement',
        modifyRecord: {
          type: 'modifyElement',
          time: Date.now(),
          content: {
            method: 'modifyElement',
            uuid: activeElem.uuid as string,
            before: {
              'detail.text': originText
            },
            after: {
              'detail.text': activeElem.detail.text
            }
          }
        }
      });

      calculator.modifyText(activeElem);
      viewer.drawFrame();
    }

    hideTextArea();
  };

  const textareaKeyDownEvent = (e: KeyboardEvent) => {
    e.stopPropagation();
  };

  const textareaKeyPressEvent = (e: KeyboardEvent) => {
    e.stopPropagation();
  };

  const textareaKeyUpEvent = (e: KeyboardEvent) => {
    e.stopPropagation();
  };

  const textareaWheelEvent = (e: WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  mask.addEventListener('click', maskClickEvent);
  textarea.addEventListener('click', textareaClickEvent);
  textarea.addEventListener('input', textareaInputEvent);
  textarea.addEventListener('blur', textareaBlurEvent);
  textarea.addEventListener('keydown', textareaKeyDownEvent);
  textarea.addEventListener('keypress', textareaKeyPressEvent);
  textarea.addEventListener('keyup', textareaKeyUpEvent);
  textarea.addEventListener('wheel', textareaWheelEvent);

  const textEditCallback = (e: TextEditEvent) => {
    if (e?.position && e?.element && e?.element?.type === 'text') {
      activeElem = e.element;
      activePosition = e.position;
    }
    showTextArea(e);
  };

  return {
    name: '@middleware/text-editor',
    use() {
      eventHub.on(coreEventKeys.TEXT_EDIT, textEditCallback);
    },
    disuse() {
      eventHub.off(coreEventKeys.TEXT_EDIT, textEditCallback);
      mask.removeEventListener('click', maskClickEvent);
      textarea.removeEventListener('click', textareaClickEvent);
      textarea.removeEventListener('input', textareaInputEvent);
      textarea.removeEventListener('blur', textareaBlurEvent);
      textarea.removeEventListener('keydown', textareaKeyDownEvent);
      textarea.removeEventListener('keypress', textareaKeyPressEvent);
      textarea.removeEventListener('keyup', textareaKeyUpEvent);
      textarea.removeEventListener('wheel', textareaWheelEvent);
      canvasWrapper.removeChild(textarea);
      mask.removeChild(canvasWrapper);
      container.removeChild(mask);

      textarea.remove();
      canvasWrapper.remove();
      mask = null as any;
      textarea = null as any;
      canvasWrapper = null as any;
      mask = null as any;
      activeElem = null;
      activePosition = null as any;
      originText = null as any;
    }
  };
};
