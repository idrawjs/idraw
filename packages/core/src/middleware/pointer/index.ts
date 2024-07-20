import type { BoardMiddleware, CoreEventMap } from '@idraw/types';
import type { DeepPointerSharedStorage } from './types';
import { keySelectedElementList } from '../selector';
import { coreEventKeys } from '../../config';

export const MiddlewarePointer: BoardMiddleware<DeepPointerSharedStorage, CoreEventMap> = (opts) => {
  const { boardContent, eventHub, sharer } = opts;
  const canvas = boardContent.boardContext.canvas;
  const container = opts.container || document.body;
  const id = `idraw-middleware-pointer-${Math.random().toString(26).substring(2)}`;

  const getCanvasRect = () => {
    const clientRect = canvas.getBoundingClientRect() as DOMRect;
    const { left, top, width, height } = clientRect;
    return { left, top, width, height };
  };

  const contextMenuPointer = document.createElement('div');
  contextMenuPointer.setAttribute('id', id);
  contextMenuPointer.style.position = 'fixed';
  contextMenuPointer.style.top = '0';
  contextMenuPointer.style.bottom = 'unset';
  contextMenuPointer.style.left = '0';
  contextMenuPointer.style.right = 'unset';

  // // TODO
  // contextMenuPointer.style.width = '10px';
  // contextMenuPointer.style.height = '10px';
  // contextMenuPointer.style.background = 'red';

  container.appendChild(contextMenuPointer);

  return {
    name: '@middleware/pointer',
    use() {
      // TODO
    },
    disuse() {
      // TODO
    },
    pointStart(e) {
      // TODO
    },
    pointEnd() {
      // TODO
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
