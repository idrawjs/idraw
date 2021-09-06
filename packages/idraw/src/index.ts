import Core from '@idraw/core';
import { TypeData, TypeConfig, } from '@idraw/types';
import util from '@idraw/util';
import { Options, Record, PrivateOptions } from './types';
import { defaultOptions } from './config';
import { TempData } from './lib/temp';
import {
  _opts, _doRecords, _unDoRecords, _hasInited, _initEvent, _tempData,
  _createOpts, _pushRecord, _bindKeyboard,
} from './names';

class iDraw extends Core {

  private [_opts]: PrivateOptions;
  private [_doRecords]: Record[] = [];
  private [_unDoRecords]: Record[] = [];
  private [_hasInited] = false; 
  private [_tempData] = new TempData();

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

  undo(): {
    doRecordCount: number,
    data: TypeData | null,
  } {
    if (!(this[_doRecords].length > 1)) {
      return {
        doRecordCount: this[_doRecords].length,
        data: null,
      };
    }
    const popRecord = this[_doRecords].pop();
    if (popRecord) {
      this[_unDoRecords].push(popRecord);
    }
    const record = this[_doRecords][this[_doRecords].length - 1];
    if (record?.data) {
      this.setData(record.data);
    }
    return {
      doRecordCount: this[_doRecords].length,
      data: record?.data || null,
    };
  }

  redo(): {
    undoRecordCount: number,
    data: TypeData | null,
  } {
    if (!(this[_unDoRecords].length > 0)) {
      return {
        undoRecordCount: this[_unDoRecords].length,
        data: null,
      };
    }
    const record = this[_unDoRecords].pop();
    if (record?.data) {
      this.setData(record.data);
    }
    return {
      undoRecordCount: this[_unDoRecords].length,
      data: record?.data || null,
    };
  }


  async exportDataURL(
    type: 'image/png' | 'image/jpeg',
    quality?: number
  ): Promise<string> {
    this.clearOperation();
    // TODO 
    // It Needs to listen the end of rendering
    // It uses the delay function to simulate the end of rendering
    await util.time.delay(300);
    const ctx = this.__getOriginContext();
    const canvas = ctx.canvas;
    const dataURL = canvas.toDataURL(type, quality);
    return dataURL;
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
    this[_bindKeyboard]();
    this[_hasInited] = true;
  }

  private [_pushRecord](data: TypeData) {
    if (this[_doRecords].length >= this[_opts].maxRecords) {
      this[_doRecords].shift();
    }
    this[_doRecords].push({ data, time: Date.now() });
    this[_unDoRecords] = [];
  }

  private [_createOpts](opts: Options): PrivateOptions {
    return { ...defaultOptions, ...opts };
  }

  private [_bindKeyboard]() {
    document.addEventListener('keydown', (e) => {
      if (this[_tempData].get('isHover') === true) {
        // TODO
        console.log(e);
      }
    });
  }

}

export default iDraw;