import Core from '@idraw/core';
import { TypeData, TypeConfig, } from '@idraw/types';
import { Options, PrivateOptions } from './types';
import { defaultOptions } from './config';
import { TempData } from './lib/temp';
import { KeyboardWatcher } from './lib/keyboard-watcher';
import {
  _opts, _hasInited, _initEvent, _tempData,
  _createOpts, _pushRecord, _keyboardWatcher,
} from './names';
import { redo, undo } from './mixins/record';
import { exportDataURL } from './mixins/file';
import { copyElements, pasteElements } from './mixins/keyboard';

class iDraw extends Core {

  private [_opts]: PrivateOptions;
  private [_hasInited] = false; 
  private [_tempData] = new TempData();
  private [_keyboardWatcher] = new KeyboardWatcher();

  constructor(mount: HTMLDivElement, opts: Options, config?: TypeConfig) {
    super(mount, {
      width: opts.width || defaultOptions.width,
      height: opts.height || defaultOptions.height,
      contextWidth: opts.contextWidth || defaultOptions.contextWidth,
      contextHeight: opts.contextHeight || defaultOptions.contextHeight,
      devicePixelRatio: opts.devicePixelRatio || defaultOptions.devicePixelRatio,
      onlyRender: opts.onlyRender || defaultOptions.onlyRender,
    }, config || {});
    this[_opts] = this[_createOpts](opts);
    this[_initEvent]();
  }

  undo(): { doRecordCount: number, data: TypeData | null, } {
    return undo(this);
  }

  redo(): { undoRecordCount: number, data: TypeData | null, } {
    return redo(this);
  }


  async exportDataURL(type: 'image/png' | 'image/jpeg', quality?: number ): Promise<string> {
    return exportDataURL(this, type, quality);
  }

  private [_initEvent]() {
    if (this[_hasInited] === true) {
      return;
    }
    this.on('changeData', (data: TypeData) => {
      this[_pushRecord](data);
    });
    this.on('mouseLeaveScreen', () => {
      this[_tempData].set('isHover', false);
    });
    this.on('mouseOverScreen', () => {
      this[_tempData].set('isHover', true);
    });
    this[_keyboardWatcher].on('keyboardCopy', () => {
      copyElements(this);
    });
    this[_keyboardWatcher].on('keyboardPaste', () => {
      pasteElements(this);
    });
    this[_hasInited] = true;
  }

  private [_pushRecord](data: TypeData) {
    const doRecords = this[_tempData].get('doRecords');
    if (doRecords.length >= this[_opts].maxRecords) {
      doRecords.shift();
    }
    doRecords.push({ data, time: Date.now() });
    this[_tempData].set('doRecords', doRecords);
    this[_tempData].set('unDoRecords', []);
  }

  private [_createOpts](opts: Options): PrivateOptions {
    return { ...defaultOptions, ...opts };
  }

  // private [_bindKeyboard]() {
  //   document.addEventListener('keydown', (e) => {
  //     if (this[_tempData].get('isHover') === true) {
  //       // TODO
  //       console.log(e);
  //     }
  //   });
  // }

}

export default iDraw;