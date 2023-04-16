import type { BoardMiddleware } from '@idraw/types';
import { drawScroller } from './scroller';

export const MiddlewareScroller: BoardMiddleware = (opts) => {
  const { viewer, viewContent } = opts;
  const { helperContext } = viewContent;

  const key = 'SCROLL';

  viewer.drawFrame();

  return {
    mode: key,
    // pointStart: (e: PointWatcherEvent) => {},
    // pointMove: (e: PointWatcherEvent) => {},
    // pointEnd: (e: PointWatcherEvent) => {},
    beforeDrawFrame({ snapshot }) {
      drawScroller(helperContext, { snapshot });
    }
  };
};
