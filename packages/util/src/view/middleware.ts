import type { BoardViewerFrameSnapshot, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';

export function getViewScaleInfoFromSnapshot(snapshot: BoardViewerFrameSnapshot) {
  const { activeStore } = snapshot;
  const sacelInfo: ViewScaleInfo = {
    scale: activeStore?.scale,
    offsetTop: activeStore?.offsetTop,
    offsetBottom: activeStore?.offsetBottom,
    offsetLeft: activeStore?.offsetLeft,
    offsetRight: activeStore?.offsetRight,
  };
  return sacelInfo;
}

export function getViewSizeInfoFromSnapshot(snapshot: BoardViewerFrameSnapshot) {
  const { activeStore } = snapshot;
  const sacelInfo: ViewSizeInfo = {
    devicePixelRatio: activeStore.devicePixelRatio,
    width: activeStore?.width,
    height: activeStore?.height,
    contextWidth: activeStore?.contextWidth,
    contextHeight: activeStore?.contextHeight,
  };
  return sacelInfo;
}

export function getMiddlewareValidStyles<C = any, S = any>(config: C, keys: string[]): S {
  const styles: S = {} as S;
  if (config) {
    keys.forEach((key) => {
      const value = (config as any)?.[key];
      if (typeof value === 'string' || typeof value === 'number') {
        (styles as any)[key] = value;
      }
    });
  }
  return styles;
}
