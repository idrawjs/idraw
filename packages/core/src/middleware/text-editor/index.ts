import type { BoardMiddleware, CoreEvent, Element, ElementSize, ViewScaleInfo } from '@idraw/types';
import { limitAngle, getDefaultElementDetailConfig } from '@idraw/util';
export const middlewareEventTextEdit = '@middleware/text-edit';

type TextEditEvent = {
  element: Element<'text'>;
  groupQueue: Element<'group'>[];
  viewScaleInfo: ViewScaleInfo;
};

const defaultElementDetail = getDefaultElementDetailConfig();

export const MiddlewareTextEditor: BoardMiddleware<Record<string, any>, CoreEvent> = (opts) => {
  const { eventHub, boardContent, viewer } = opts;
  const canvas = boardContent.boardContext.canvas;
  const textarea = document.createElement('textarea');
  const canvasWrapper = document.createElement('div');
  const container = opts.container || document.body;
  const mask = document.createElement('div');
  let activeElem: Element<'text'> | null = null;

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
  };

  const hideTextArea = () => {
    mask.style.display = 'none';
    activeElem = null;
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

    textarea.style.position = 'absolute';
    textarea.style.left = `${elemX}px`;
    textarea.style.top = `${elemY}px`;
    textarea.style.width = `${elemW}px`;
    textarea.style.height = `${elemH}px`;
    textarea.style.transform = `rotate(${limitAngle(element.angle || 0)}deg)`;
    // textarea.style.border = 'none';
    textarea.style.boxSizing = 'border-box';
    textarea.style.border = '1px solid #1973ba';
    textarea.style.resize = 'none';
    textarea.style.overflow = 'hidden';
    textarea.style.wordBreak = 'break-all';
    textarea.style.background = '#FFFFFF';
    textarea.style.color = '#333333';
    textarea.style.fontSize = `${detail.fontSize * scale}px`;
    textarea.style.lineHeight = `${detail.lineHeight * scale}px`;
    textarea.style.fontFamily = detail.fontFamily;
    textarea.style.fontWeight = `${detail.fontWeight}`;
    textarea.value = detail.text || '';
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

  mask.addEventListener('click', () => {
    hideTextArea();
  });
  textarea.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  textarea.addEventListener('input', (e) => {
    if (activeElem) {
      activeElem.detail.text = (e.target as any).value || '';
      viewer.drawFrame();
    }
  });
  textarea.addEventListener('blur', () => {
    hideTextArea();
  });

  const textEditCallback = (e: TextEditEvent) => {
    if (e?.element && e?.element?.type === 'text') {
      activeElem = e.element;
    }
    showTextArea(e);
  };

  return {
    name: '@middleware/text-editor',
    use() {
      eventHub.on(middlewareEventTextEdit, textEditCallback);
    },
    disuse() {
      eventHub.off(middlewareEventTextEdit, textEditCallback);
    }
  };
};
