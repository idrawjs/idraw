export const EVENT_KEY_CHANGE = 'change';
export const EVENT_KEY_CURSOR = 'cursor';
export const EVENT_KEY_RULER = 'ruler';
export const EVENT_KEY_SCALE = 'scale';
export const EVENT_KEY_SELECT = 'select';
export const EVENT_KEY_CLEAR_SELECT = 'clearSelect';
export const EVENT_KEY_TEXT_EDIT = 'textEdit';
export const EVENT_KEY_TEXT_CHANGE = 'textChange';
export const EVENT_KEY_CONTEXT_MENU = 'contextMenu';
export const EVENT_KEY_SELECT_IN_GROUP = 'selectInGroup';
export const EVENT_KEY_SNAP_TO_GRID = 'snapToGrid';

export type CoreEventKeys = {
  CURSOR: typeof EVENT_KEY_CURSOR;
  CHANGE: typeof EVENT_KEY_CHANGE;
  RULER: typeof EVENT_KEY_RULER;
  SCALE: typeof EVENT_KEY_SCALE;
  SELECT: typeof EVENT_KEY_SELECT;
  CLEAR_SELECT: typeof EVENT_KEY_CLEAR_SELECT;
  TEXT_EDIT: typeof EVENT_KEY_TEXT_EDIT;
  TEXT_CHANGE: typeof EVENT_KEY_TEXT_CHANGE;
  CONTEXT_MENU: typeof EVENT_KEY_CONTEXT_MENU;
  SELECT_IN_GROUP: typeof EVENT_KEY_SELECT_IN_GROUP;
  SNAP_TO_GRID: typeof EVENT_KEY_SELECT_IN_GROUP;
};

const innerEventKeys: CoreEventKeys = {
  CURSOR: EVENT_KEY_CURSOR,
  CHANGE: EVENT_KEY_CHANGE,
  RULER: EVENT_KEY_RULER,
  SCALE: EVENT_KEY_SCALE,
  SELECT: EVENT_KEY_SELECT,
  CLEAR_SELECT: EVENT_KEY_CLEAR_SELECT,
  TEXT_EDIT: EVENT_KEY_TEXT_EDIT,
  TEXT_CHANGE: EVENT_KEY_TEXT_CHANGE,
  CONTEXT_MENU: EVENT_KEY_CONTEXT_MENU,
  SELECT_IN_GROUP: EVENT_KEY_SELECT_IN_GROUP,
  SNAP_TO_GRID: EVENT_KEY_SELECT_IN_GROUP
};

const coreEventKeys = {} as CoreEventKeys;
Object.keys(innerEventKeys).forEach((keyName: string) => {
  Object.defineProperty(coreEventKeys, keyName, {
    value: innerEventKeys[keyName as keyof CoreEventKeys],
    writable: false
  });
});

export { coreEventKeys };
