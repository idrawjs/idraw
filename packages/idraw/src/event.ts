import type { CoreEventMap } from '@idraw/types';
import { coreEventKeys } from '@idraw/core';
import type { CoreEventKeys } from '@idraw/core';

export type IDrawEventKeys = CoreEventKeys; // TODO

export type IDrawEvent = CoreEventMap;

export const eventKeys = coreEventKeys; // TODO
