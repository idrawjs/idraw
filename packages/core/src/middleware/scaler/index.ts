import type { Point, BoardMiddleware, PointWatcherEvent, BoardWatherWheelXEvent, BoardWatherWheelYEvent } from '@idraw/types';

export const MiddlewareScaler: BoardMiddleware = (opts) => {
  const key = 'SCALE';
  const { viewer, sharer } = opts;
  return {
    mode: key,
    isDefault: true,
    wheelScale(e) {
      // console.log(' wheelScale ============= ', e);
      const { deltaY } = e;
      const { scale } = sharer.getActiveScaleInfo();
      if (deltaY < 0) {
        viewer.scale(scale * 1.1);
        viewer.drawFrame();
      } else if (deltaY > 0) {
        viewer.scale(scale * 0.9);
        viewer.drawFrame();
      }
    }
  };
};
