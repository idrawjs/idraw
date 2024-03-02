import type { BoardMiddleware, CoreEventMap, Point } from '@idraw/types';

const key = 'DRAG';
const keyPrevPoint = Symbol(`${key}_prevPoint`);

type DraggerSharedStorage = {
  [keyPrevPoint]: Point | null;
};

export const MiddlewareDragger: BoardMiddleware<DraggerSharedStorage, CoreEventMap> = (opts) => {
  const { eventHub, sharer, viewer } = opts;
  let isDragging = false;

  return {
    name: '@middleware/dragger',
    hover() {
      if (isDragging === true) {
        return;
      }
      eventHub.trigger('cursor', {
        type: 'drag-default'
      });
    },

    pointStart(e) {
      const { point } = e;
      sharer.setSharedStorage(keyPrevPoint, point);
      isDragging = true;
      eventHub.trigger('cursor', {
        type: 'drag-active'
      });
    },

    pointMove(e) {
      const { point } = e;
      const prevPoint = sharer.getSharedStorage(keyPrevPoint);
      if (point && prevPoint) {
        const moveX = point.x - prevPoint.x;
        const moveY = point.y - prevPoint.y;
        viewer.scroll({ moveX, moveY });
        viewer.drawFrame();
      }
      sharer.setSharedStorage(keyPrevPoint, point);
    },

    pointEnd() {
      isDragging = false;
      sharer.setSharedStorage(keyPrevPoint, null);
      eventHub.trigger('cursor', {
        type: 'drag-default'
      });
    }
  };
};
