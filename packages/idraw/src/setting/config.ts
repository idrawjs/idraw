import type { IDrawSettings, IDrawOptions, IDrawStorage, IDrawMode } from '@idraw/types';
import { istype } from '@idraw/util';
import {
  getMiddlewareCreatorStyles,
  getMiddlewareSelectorStyles,
  getMiddlewareScrollerStyles,
  getMiddlewareRulerStyles,
  getMiddlewareTextEditorStyles,
  getMiddlewareInfoStyles,
  getMiddlewarePathEditorStyles,
  getMiddlewarePathCreatorStyles,
} from '@idraw/core';

export const defaultMode: IDrawMode = 'select';

export const defaultSettings: Required<Pick<IDrawSettings, 'mode' | 'history'>> = {
  mode: defaultMode,
  history: false,
};

export const defaultOptions: Required<Pick<IDrawOptions, 'devicePixelRatio'>> = {
  devicePixelRatio: window.devicePixelRatio,
};

export function getDefaultStorage(): IDrawStorage {
  const storage: IDrawStorage = {
    mode: defaultMode,
    enableCreate: false,
    enablePathCreate: false,
    enablePathEdit: false,
    enableSelect: false,
    enableSelectLayout: false,
    enableTextEdit: false,
    enableDrag: false,

    enableRuler: false,
    enableScroll: false,
    enableInfo: false,
    enableScale: false,

    middlewareStyles: {
      selector: {},
      info: {},
      ruler: {},
      scroller: {},
      layoutSelector: {},
      creator: {},
      textEditor: {},
      pathCreator: {},
      pathEditor: {},
    },
  };
  return storage;
}

export function parseSettings(opts: IDrawSettings) {
  const { mode, styles } = opts;
  const settings: IDrawSettings = {};
  if (istype.string(mode)) {
    settings.mode = mode;
  }
  if (styles) {
    settings.styles = parseStrictStyles(opts);
  }

  return settings;
}

export function parseStrictStyles(settings: IDrawSettings): IDrawSettings['styles'] {
  const styles = parseStyles(settings);
  const strictStyles: IDrawSettings['styles'] = {};

  const { selector, info, ruler, scroller, layoutSelector } = styles;
  if (Object.keys(selector).length > 0) {
    strictStyles.selector = selector;
  }
  if (Object.keys(info).length > 0) {
    strictStyles.info = info;
  }

  if (Object.keys(ruler).length > 0) {
    strictStyles.ruler = ruler;
  }
  if (Object.keys(scroller).length > 0) {
    strictStyles.scroller = scroller;
  }
  if (Object.keys(layoutSelector).length > 0) {
    strictStyles.layoutSelector = layoutSelector;
  }

  return strictStyles;
}

export function parseStyles(settings: IDrawSettings): Required<Required<IDrawSettings>['styles']> {
  const styles: Required<IDrawSettings['styles']> = {
    selector: {},
    ruler: {},
    info: {},
    scroller: {},
    layoutSelector: {},
    creator: {},
    textEditor: {},
    pathCreator: {},
    pathEditor: {},
  };
  if (settings.styles) {
    const { selector, ruler, info, scroller, layoutSelector, creator, textEditor, pathCreator, pathEditor } =
      settings.styles;

    // selector
    styles.selector = getMiddlewareSelectorStyles(selector);

    // creator
    styles.creator = getMiddlewareCreatorStyles(creator);

    // info
    styles.info = getMiddlewareInfoStyles(info);

    // ruler
    styles.ruler = getMiddlewareRulerStyles(ruler);

    // scroller
    styles.scroller = getMiddlewareScrollerStyles(scroller);

    // textEditor
    styles.textEditor = getMiddlewareTextEditorStyles(textEditor);

    // pathCreator
    styles.pathCreator = getMiddlewarePathCreatorStyles(pathCreator);

    // pathEditor
    styles.pathEditor = getMiddlewarePathEditorStyles(pathEditor);

    // layoutSelector
    // TODO
    if (istype.string(layoutSelector?.activeColor)) {
      styles.layoutSelector.activeColor = layoutSelector?.activeColor;
    }
  }

  return styles;
}
