import type { UtilEventEmitter, CoreEventMap, CoreEventChange } from '@idraw/types';
import { coreEventKeys } from '../static';

type EventHub = UtilEventEmitter<CoreEventMap>;

export function triggerChangeEvent(eventHub: EventHub, e: CoreEventChange, status?: 'continuous' | 'all') {
  if (status === 'continuous') {
    eventHub.trigger(coreEventKeys.CHANGING, e);
  } else if (status === 'all') {
    eventHub.trigger(coreEventKeys.CHANGING, e);
    eventHub.trigger(coreEventKeys.CHANGE, e);
  } else {
    eventHub.trigger(coreEventKeys.CHANGE, e);
  }
}
