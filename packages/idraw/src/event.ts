import { middlewareEventScale, middlewareEventSelect } from '@idraw/core';
import type { CoreEvent, Data } from '@idraw/types';

export interface IDrawEventKeys {
  select: typeof middlewareEventSelect;
  scale: typeof middlewareEventScale;
  change: 'change';
}

export type IDrawEvent = CoreEvent & {
  change: {
    data: Data;
    type: 'updateElement' | 'deleteElement' | 'moveElement' | 'addElement' | 'dragElement' | 'resizeElement' | 'setData' | 'undo' | 'redo' | 'other';
  };
};

// TODO
const EventKeys = {} as {
  select: typeof middlewareEventSelect;
  scale: typeof middlewareEventScale;
  change: 'change';
};
Object.defineProperty(EventKeys, 'select', {
  value: middlewareEventSelect,
  writable: false
});
Object.defineProperty(EventKeys, 'scale', {
  value: middlewareEventScale,
  writable: false
});

export { EventKeys };
