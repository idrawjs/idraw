import { middlewareEventScale, middlewareEventSelect } from '@idraw/core';
import type { CoreEvent } from '@idraw/types';

export interface IDrawEventKeys {
  select: typeof middlewareEventSelect;
  scale: typeof middlewareEventScale;
  change: 'change';
}

export type IDrawEvent = CoreEvent & {
  [key: string]: any;
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
