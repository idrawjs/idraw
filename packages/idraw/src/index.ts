import Core from '@idraw/core';
import {
  TypeData, TypeConfig,
} from '@idraw/types';
import { Options, Record, PrivateOptions } from './types';
import { defaultOptions } from './config';

const _opts = Symbol('_opts');
const _doRecords = Symbol('_doRecords');
const _unDoRecords = Symbol('_unDoRecords');
const _hasInited = Symbol('_hasInited');
const _initEvent = Symbol('_initEvent');

class IDraw extends Core {

  private [_opts]: PrivateOptions;
  private [_doRecords]: Record[] = [];
  private [_unDoRecords]: Record[] = [];
  private [_hasInited] = false; 

  constructor(mount: HTMLDivElement, opts: Options, config?: TypeConfig) {
    super(mount, {
      width: opts.width || defaultOptions.width,
      height: opts.height || defaultOptions.height,
      contextWidth: opts.contextWidth || defaultOptions.contextWidth,
      contextHeight: opts.contextHeight || defaultOptions.contextHeight,
      devicePixelRatio: opts.devicePixelRatio || defaultOptions.devicePixelRatio,
      onlyRender: opts.onlyRender || defaultOptions.onlyRender,
    }, config || {});
    this[_opts] = this._createOpts(opts);
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

  private [_initEvent]() {
    if (this[_hasInited] === true) {
      return;
    }
    this.on('changeData', (data: TypeData) => {
      this._pushRecord(data);
    });
    this[_hasInited] = true;
  }

  private _pushRecord(data: TypeData) {
    if (this[_doRecords].length >= this[_opts].maxRecords) {
      this[_doRecords].shift();
    }
    this[_doRecords].push({ data, time: Date.now() });
    this[_unDoRecords] = [];
  }

  private _createOpts(opts: Options): PrivateOptions {
    return { ...defaultOptions, ...opts };
  }
}

export default IDraw;