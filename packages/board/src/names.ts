const _canvas = Symbol('_canvas');
const _displayCanvas = Symbol('_displayCanvas');
const _helperCanvas = Symbol('_helperCanvas');
const _mount = Symbol('_mount');
const _opts = Symbol('_opts');
const _hasRendered = Symbol('_hasRendered');
const _ctx = Symbol('_ctx');
const _helperCtx = Symbol('_helperCtx');

const _watcher = Symbol('_watcher');
const _render = Symbol('_render');
const _parsePrivateOptions = Symbol('_parsePrivateOptions');
const _scroller = Symbol('_scroller');
const _initEvent = Symbol('_initEvent');
const _doScrollX = Symbol('_doScrollX');
const _doScrollY = Symbol('_doScrollY');
const _doMoveScroll = Symbol('_doMoveScroll');
// const _doDoubleClick = Symbol('_doDoubleClick');
const _resetContext = Symbol('_resetContext');
const _screen = Symbol('_screen');
const _tempData = Symbol('_tempData');

export {
  _canvas, _displayCanvas, _mount, _opts, _hasRendered, _ctx,
  _watcher, _render, _parsePrivateOptions, _scroller,
  _initEvent, _doScrollX, _doScrollY, _doMoveScroll, _resetContext,
  _screen, _tempData, _helperCtx,  _helperCanvas,
};