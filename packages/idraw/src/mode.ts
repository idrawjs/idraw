import type { IDrawMode, IDrawStorage } from '@idraw/types';
import { Store } from '@idraw/util';
import {
  Core,
  MiddlewareLayoutSelector,
  MiddlewareSelector,
  MiddlewareScroller,
  MiddlewareScaler,
  MiddlewareRuler,
  MiddlewareTextEditor,
  MiddlewareDragger,
  MiddlewareInfo
} from '@idraw/core';
import { IDrawEvent } from './event';

function isValidMode(mode: string | IDrawMode) {
  return ['select', 'drag', 'readOnly'].includes(mode);
}

export function runMiddlewares(core: Core<IDrawEvent>, store: Store<IDrawStorage>) {
  const { enableRuler, enableScale, enableScroll, enableSelect, enableTextEdit, enableDrag, enableInfo } = store.getSnapshot();
  const styles = store.get('middlewareStyles');
  if (enableScroll === true) {
    core.use(MiddlewareScroller, styles?.scroller);
  } else if (enableScroll === false) {
    core.disuse(MiddlewareScroller);
  }

  if (enableSelect === true) {
    core.use(MiddlewareLayoutSelector, styles?.layoutSelector);
    core.use(MiddlewareSelector, styles?.selector);
  } else if (enableSelect === false) {
    core.disuse(MiddlewareLayoutSelector);
    core.disuse(MiddlewareSelector);
  }

  if (enableScale === true) {
    core.use(MiddlewareScaler);
  } else if (enableScale === false) {
    core.disuse(MiddlewareScaler);
  }

  if (enableRuler === true) {
    core.use(MiddlewareRuler, styles?.ruler);
  } else if (enableRuler === false) {
    core.disuse(MiddlewareRuler);
  }

  if (enableTextEdit === true) {
    core.use(MiddlewareTextEditor);
  } else if (enableTextEdit === false) {
    core.disuse(MiddlewareTextEditor);
  }

  if (enableDrag === true) {
    core.use(MiddlewareDragger);
  } else if (enableDrag === false) {
    core.disuse(MiddlewareDragger);
  }

  if (enableInfo === true) {
    core.use(MiddlewareInfo, styles?.info);
  } else if (enableInfo === false) {
    core.disuse(MiddlewareInfo);
  }
}

export function changeMode(mode: IDrawMode, core: Core<IDrawEvent>, store: Store<IDrawStorage>) {
  let enableScale: boolean = false;
  let enableScroll: boolean = false;
  let enableSelect: boolean = false;
  let enableTextEdit: boolean = false;
  let enableDrag: boolean = false;
  let enableRuler: boolean = false;
  let enableInfo: boolean = false;

  let innerMode: IDrawMode = 'select';
  store.set('mode', innerMode);
  if (isValidMode(mode)) {
    innerMode = mode;
  } else {
    // eslint-disable-next-line no-console
    console.warn(`${mode} is invalid mode of iDraw.js`);
  }

  if (innerMode === 'select') {
    enableScale = true;
    enableScroll = true;
    enableSelect = true;
    enableInfo = true;
    enableTextEdit = true;
    enableDrag = false;
    enableRuler = true;
  } else if (innerMode === 'drag') {
    enableScale = true;
    enableScroll = true;
    enableSelect = false;
    enableTextEdit = false;
    enableDrag = true;
    enableRuler = true;
  } else if (innerMode === 'readOnly') {
    enableScale = false;
    enableScroll = false;
    enableSelect = false;
    enableTextEdit = false;
    enableDrag = false;
    enableRuler = false;
  }

  store.set('enableScale', enableScale);
  store.set('enableScroll', enableScroll);
  store.set('enableSelect', enableSelect);
  store.set('enableTextEdit', enableTextEdit);
  store.set('enableDrag', enableDrag);
  store.set('enableRuler', enableRuler);
  store.set('enableInfo', enableInfo);
  runMiddlewares(core, store);
}
