import type { Middleware, CoreEventMap } from '@idraw/types';
import type { DeepPointerSharedStorage } from './types';
import { keySelectedElementList } from '../selector';
import { coreEventKeys } from '../../config';

export const MiddlewarePointer: Middleware<DeepPointerSharedStorage, CoreEventMap> = (opts) => {
  const { boardContent, eventHub, sharer } = opts;
  const canvas = boardContent.boardContext.canvas;
  const container = opts.container || document.body;
  const id = `idraw-middleware-pointer-${Math.random().toString(26).substring(2)}`;

  const getCanvasRect = () => {
    const clientRect = canvas.getBoundingClientRect() as DOMRect;
    const { left, top, width, height } = clientRect;
    return { left, top, width, height };
  };

  let contextMenuPointer = document.createElement('div');

  return {
    name: '@middleware/pointer',
    use() {
      contextMenuPointer.setAttribute('id', id);
      contextMenuPointer.style.position = 'fixed';
      contextMenuPointer.style.top = '0';
      contextMenuPointer.style.bottom = 'unset';
      contextMenuPointer.style.left = '0';
      contextMenuPointer.style.right = 'unset';
      container.appendChild(contextMenuPointer);
    },
    disuse() {
      container.removeChild(contextMenuPointer);
      contextMenuPointer.remove();
      contextMenuPointer = null as any;
    },
    contextMenu(e) {
      const { point } = e;
      const { left, top } = getCanvasRect();
      contextMenuPointer.style.left = `${left + point.x}px`;
      contextMenuPointer.style.top = `${top + point.y}px`;

      const selectedElements = sharer.getSharedStorage(keySelectedElementList);
      eventHub.trigger(coreEventKeys.CONTEXT_MENU, {
        pointerContainer: contextMenuPointer,
        selectedElements: selectedElements || []
      });
    }
  };
};
