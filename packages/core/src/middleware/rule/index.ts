import type { Point, BoardMiddleware, PointWatcherEvent, BoardWatherWheelXEvent, BoardWatherWheelYEvent } from '@idraw/types';

export const MiddlewareRuler: BoardMiddleware = (opts) => {
  const key = 'RULE';

  return {
    mode: key,
    isDefault: true,
    scale(e) {
      console.log('scale =====', e);
    },
    scrollX(e) {
      console.log('scrollX =====', e);
    },
    scrollY(e) {
      console.log('scrollY =====', e);
    },
    resize(e) {
      console.log('scale =====', e);
    }
  };
};
