import type {
  IDrawMode,
  IDrawModeEventMap,
  IDrawStorage,
  MiddlewareSelectorConfig,
  MiddlewarePathEditorConfig,
} from '@idraw/types';
import { Store } from '@idraw/util';
import {
  Core,
  MiddlewareLayoutSelector,
  MiddlewareCreator,
  MiddlewareSelector,
  MiddlewareScroller,
  MiddlewareScaler,
  MiddlewareRuler,
  MiddlewareTextEditor,
  MiddlewareDragger,
  MiddlewareInfo,
  MiddlewarePointer,
  MiddlewarePathCreator,
  MiddlewarePathEditor,
} from '@idraw/core';
import { IDrawEvent, eventKeys } from '../event';

function isValidMode(mode: string | IDrawMode) {
  return ['create', 'select', 'select-layout', 'drag', 'readonly', 'create-path', 'edit-path'].includes(mode);
}

export function runMiddlewares<T extends IDrawMode>(
  e: IDrawModeEventMap[T] | undefined | null,
  core: Core<IDrawEvent>,
  store: Store<IDrawStorage>
) {
  const {
    enableCreate,
    enableRuler,
    enableScale,
    enableScroll,
    enableSelect,
    enableSelectLayout,
    enableTextEdit,
    enableDrag,
    enableInfo,
    enablePathCreate,
    enablePathEdit,
  } = store.getSnapshot();

  const styles = store.get('middlewareStyles');
  if (enableScroll === true) {
    core.use(MiddlewareScroller, styles?.scroller);
  } else {
    core.disuse(MiddlewareScroller);
  }

  if (enableCreate === true) {
    core.use(MiddlewareCreator, {
      ...styles?.creator,
      afterCreated: () => {
        changeMode('select', undefined, core, store);
      },
    });
    core.trigger(eventKeys.CREATE, e as IDrawModeEventMap['create']);
  } else {
    core.disuse(MiddlewareCreator);
  }

  if (enableTextEdit === true) {
    core.use(MiddlewareTextEditor, styles.textEditor);
  } else {
    core.disuse(MiddlewareTextEditor);
  }

  if (enablePathEdit === true) {
    core.use<Partial<MiddlewarePathEditorConfig>>(MiddlewarePathEditor, {
      ...styles.pathEditor,
      afterClickAway: () => {
        changeMode('select', undefined, core, store);
      },
    });
    // core.trigger(eventKeys.PATH_EDIT, undefined);
  } else {
    core.disuse(MiddlewarePathEditor /* TODO: style */);
    // core.trigger(eventKeys.CLEAR_PATH_EDIT, undefined);
  }

  if (enableSelect === true) {
    core.use<Partial<MiddlewareSelectorConfig>>(MiddlewareSelector, {
      ...styles?.selector,
      afterDoubleClickMaterial: ({ material }) => {
        if (material?.type === 'path') {
          changeMode('edit-path', undefined, core, store);
          core.trigger(eventKeys.PATH_EDIT, {
            id: material.id,
          });
        }
      },
    });
  } else {
    core.disuse(MiddlewareSelector);
  }

  if (enableSelectLayout === true) {
    core.use(MiddlewareLayoutSelector, styles?.layoutSelector);
  } else {
    core.disuse(MiddlewareLayoutSelector);
  }

  if (enableScale === true) {
    core.use(MiddlewareScaler);
  } else {
    core.disuse(MiddlewareScaler);
  }

  if (enableRuler === true) {
    core.use(MiddlewareRuler, styles?.ruler);
  } else {
    core.disuse(MiddlewareRuler);
  }

  if (enableDrag === true) {
    core.use(MiddlewareDragger);
  } else {
    core.disuse(MiddlewareDragger);
  }

  if (enableInfo === true) {
    core.use(MiddlewareInfo, styles?.info);
  } else {
    core.disuse(MiddlewareInfo);
  }

  if (enablePathCreate === true) {
    core.use(MiddlewarePathCreator, styles.pathCreator);
    core.trigger(eventKeys.PATH_CREATE, undefined);
  } else {
    core.trigger(eventKeys.CLEAR_PATH_CREATE, undefined);
    core.disuse(MiddlewarePathCreator /* TODO: style */);
  }

  core.use(MiddlewarePointer);
}

export function changeMode<T extends IDrawMode>(
  mode: IDrawMode,
  e: IDrawModeEventMap[T] | undefined,
  core: Core<IDrawEvent>,
  store: Store<IDrawStorage>
) {
  let enableCreate: boolean = false;
  let enableSelect: boolean = false;
  let enableSelectLayout: boolean = false;
  let enableTextEdit: boolean = false;
  let enableDrag: boolean = false;
  let enablePathCreate: boolean = false;
  let enablePathEdit: boolean = false;

  const enableRuler: boolean = store.get('enableRuler');
  const enableScroll: boolean = store.get('enableScroll');
  const enableInfo: boolean = store.get('enableInfo');
  const enableScale: boolean = store.get('enableScale');

  let innerMode: IDrawMode = mode || 'select';

  if (isValidMode(mode)) {
    innerMode = mode;
  } else {
    // eslint-disable-next-line no-console
    console.warn(`${mode} is invalid mode of iDraw.js`);
  }
  store.set('mode', innerMode);

  if (innerMode === 'create') {
    enableCreate = true;
    enableSelect = true;
    enableSelectLayout = false;
    enableTextEdit = false;
    enableDrag = false;
    enablePathCreate = false;
    enablePathEdit = true;

    // enableRuler = true;
    // enableScroll = true;
    // enableInfo = false;
    // enableScale = true;
  } else if (innerMode === 'drag') {
    enableCreate = false;
    enableSelect = false;
    enableSelectLayout = false;
    enableTextEdit = false;
    enableDrag = true;
    enablePathCreate = false;
    enablePathEdit = false;

    // enableRuler = true;
    // enableScale = true;
    // enableScroll = true;
    // enableInfo = false;
  } else if (innerMode === 'readonly') {
    enableCreate = false;
    enableSelect = false;
    enableSelectLayout = false;
    enableTextEdit = false;
    enableDrag = false;
    enablePathCreate = false;
    enablePathEdit = false;

    // enableRuler = false;
    // enableScale = false;
    // enableScroll = false;
    // enableInfo = false;
  } else if (innerMode === 'create-path') {
    enableCreate = false;
    enableSelect = false;
    enableSelectLayout = false;
    enableTextEdit = false;
    enableDrag = false;
    enablePathCreate = true;
    enablePathEdit = false;

    // enableScale = true;
    // enableScroll = true;
    // enableInfo = false;
    // enableRuler = true;
  } else if (innerMode === 'edit-path') {
    enableCreate = false;
    enableSelect = false;
    enableSelectLayout = false;
    enableTextEdit = false;
    enableDrag = false;
    enablePathCreate = false;
    enablePathEdit = true;

    // enableScale = true;
    // enableScroll = true;
    // enableInfo = false;
    // enableRuler = true;
  } else if (mode === 'select-layout') {
    enableCreate = false;
    enableSelect = false;
    enableSelectLayout = true;
    enableTextEdit = false;
    enableDrag = false;
    enablePathCreate = false;
    enablePathEdit = true;

    // enableScale = true;
    // enableScroll = true;
    // enableInfo = false;
    // enableRuler = true;
  } else {
    // default is "select" mode
    enableCreate = false;
    enableSelect = true;
    enableSelectLayout = false;
    enableTextEdit = true;
    enableDrag = false;
    enablePathCreate = false;
    enablePathEdit = true;

    // enableScale = true;
    // enableScroll = true;
    // enableInfo = true;
    // enableRuler = true;
  }

  store.set('enableCreate', enableCreate);

  store.set('enableSelect', enableSelect);
  store.set('enableSelectLayout', enableSelectLayout);
  store.set('enableTextEdit', enableTextEdit);
  store.set('enableDrag', enableDrag);
  store.set('enablePathCreate', enablePathCreate);
  store.set('enablePathEdit', enablePathEdit);

  store.set('enableRuler', enableRuler);
  store.set('enableInfo', enableInfo);
  store.set('enableScale', enableScale);
  store.set('enableScroll', enableScroll);

  runMiddlewares<T>(e, core, store);
  core.trigger(eventKeys.MODE_CHANGE, { mode });
}
