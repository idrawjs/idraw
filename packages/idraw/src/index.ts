import Core from '@idraw/core';
import {
  TypeData,
  TypeCoreOptions,
  TypeConfig,
} from '@idraw/types';

type Options = {
  maxRecords?: number;
} & TypeCoreOptions;

type PrivateOptions = {
  maxRecords: number;
} & Options;

type Record = {
  data: TypeData;
  time: number;
}

const _opts = Symbol('_opts');
const _records = Symbol('_records');
const _hasInited = Symbol('_hasInited');
const _initEvent = Symbol('_initEvent');

class IDraw extends Core {

  private [_opts]: PrivateOptions;
  private [_records]: Record[] = [];
  private [_hasInited] = false; 

  constructor(mount: HTMLDivElement, opts: Options, config: TypeConfig) {
    super(mount, {
      width: opts.width,
      height: opts.height,
      devicePixelRatio: opts.devicePixelRatio
    }, config);
    this[_opts] = this._createOpts(opts);
    this[_initEvent]();
  }

  undo() {
    if (!(this[_records].length > 1)) {
      return;
    }
    this[_records].pop();
    const record = this[_records][this[_records].length - 1];
    if (record?.data) {
      this.setData(record.data);
      this.draw();
    }
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
    if (this[_records].length >= this[_opts].maxRecords) {
      this[_records].shift();
    }
    this[_records].push({ data, time: Date.now() })
  }

  private _createOpts(opts: Options): PrivateOptions {
    const defaultOpts = {
      maxRecords: 10,
    }
    return { ...defaultOpts, ...opts }
  }
}

export default IDraw;