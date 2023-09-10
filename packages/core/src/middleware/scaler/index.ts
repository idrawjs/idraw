import type { PointSize, BoardMiddleware, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';

export const MiddlewareScaler: BoardMiddleware = (opts) => {
  const key = 'SCALE';
  const { viewer, sharer } = opts;
  return {
    mode: key,
    isDefault: true,
    wheelScale(e) {
      const { deltaY, point } = e;
      const { scale } = sharer.getActiveViewScaleInfo();
      let newScaleNum = scale;
      if (deltaY < 0) {
        newScaleNum = scale * 1.1;
      } else if (deltaY > 0) {
        newScaleNum = scale * 0.9;
      }
      const { moveX, moveY } = viewer.scale({ scale: newScaleNum, point });
      viewer.scroll({ moveX, moveY });
      viewer.drawFrame();
    }
  };
};
