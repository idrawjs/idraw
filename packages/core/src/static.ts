export const EVENT_KEY_CHANGE = 'change';
export const EVENT_KEY_CHANGING = 'changing';
export const EVENT_KEY_CURSOR = 'cursor';
export const EVENT_KEY_RULER = 'ruler';
export const EVENT_KEY_SCALE = 'scale';
export const EVENT_KEY_CREATE = 'create';
export const EVENT_KEY_CLEAR_CREATE = 'clearCreate';
export const EVENT_KEY_SELECT = 'select';
export const EVENT_KEY_SELECT_LAYOUT = 'selectLayout';
export const EVENT_KEY_CLEAR_SELECT = 'clearSelect';
export const EVENT_KEY_TEXT_EDIT = 'textEdit';
export const EVENT_KEY_TEXT_CHANGE = 'textChange';
export const EVENT_KEY_CONTEXT_MENU = 'contextMenu';
export const EVENT_KEY_SELECT_IN_GROUP = 'selectInGroup';
export const EVENT_KEY_SNAP_TO_GRID = 'snapToGrid';
export const EVENT_KEY_PATH_EDIT = 'pathEdit';
export const EVENT_CLEAR_PATH_EDIT = 'clearPathEdit';
export const EVENT_KEY_PATH_CREATE = 'pathCreate';
export const EVENT_CLEAR_PATH_CREATE = 'clearPathCreate';
export const EVENT_KEY_MODE_CHANGE = 'modeChange';

export type CoreEventKeys = {
  CURSOR: typeof EVENT_KEY_CURSOR;
  CHANGE: typeof EVENT_KEY_CHANGE;
  CHANGING: typeof EVENT_KEY_CHANGING;
  RULER: typeof EVENT_KEY_RULER;
  SCALE: typeof EVENT_KEY_SCALE;
  SELECT: typeof EVENT_KEY_SELECT;
  SELECT_LAYOUT: typeof EVENT_KEY_SELECT_LAYOUT;
  CLEAR_SELECT: typeof EVENT_KEY_CLEAR_SELECT;
  CREATE: typeof EVENT_KEY_CREATE;
  CLEAR_CREATE: typeof EVENT_KEY_CLEAR_CREATE;
  TEXT_EDIT: typeof EVENT_KEY_TEXT_EDIT;
  TEXT_CHANGE: typeof EVENT_KEY_TEXT_CHANGE;
  CONTEXT_MENU: typeof EVENT_KEY_CONTEXT_MENU;
  SELECT_IN_GROUP: typeof EVENT_KEY_SELECT_IN_GROUP;
  SNAP_TO_GRID: typeof EVENT_KEY_SELECT_IN_GROUP;
  PATH_EDIT: typeof EVENT_KEY_PATH_EDIT;
  CLEAR_PATH_EDIT: typeof EVENT_CLEAR_PATH_EDIT;
  PATH_CREATE: typeof EVENT_KEY_PATH_CREATE;
  CLEAR_PATH_CREATE: typeof EVENT_CLEAR_PATH_CREATE;
  MODE_CHANGE: typeof EVENT_KEY_MODE_CHANGE;
};

const innerEventKeys: CoreEventKeys = {
  CURSOR: EVENT_KEY_CURSOR,
  CHANGE: EVENT_KEY_CHANGE,
  CHANGING: EVENT_KEY_CHANGING,
  RULER: EVENT_KEY_RULER,
  SCALE: EVENT_KEY_SCALE,
  CREATE: EVENT_KEY_CREATE,
  CLEAR_CREATE: EVENT_KEY_CLEAR_CREATE,
  SELECT_LAYOUT: EVENT_KEY_SELECT_LAYOUT,
  SELECT: EVENT_KEY_SELECT,
  CLEAR_SELECT: EVENT_KEY_CLEAR_SELECT,
  TEXT_EDIT: EVENT_KEY_TEXT_EDIT,
  TEXT_CHANGE: EVENT_KEY_TEXT_CHANGE,
  CONTEXT_MENU: EVENT_KEY_CONTEXT_MENU,
  SELECT_IN_GROUP: EVENT_KEY_SELECT_IN_GROUP,
  SNAP_TO_GRID: EVENT_KEY_SELECT_IN_GROUP,
  PATH_EDIT: EVENT_KEY_PATH_EDIT,
  CLEAR_PATH_EDIT: EVENT_CLEAR_PATH_EDIT,
  PATH_CREATE: EVENT_KEY_PATH_CREATE,
  CLEAR_PATH_CREATE: EVENT_CLEAR_PATH_CREATE,
  MODE_CHANGE: EVENT_KEY_MODE_CHANGE,
};

const coreEventKeys = {} as CoreEventKeys;
Object.keys(innerEventKeys).forEach((keyName: string) => {
  Object.defineProperty(coreEventKeys, keyName, {
    value: innerEventKeys[keyName as keyof CoreEventKeys],
    writable: false,
  });
});

export { coreEventKeys };
