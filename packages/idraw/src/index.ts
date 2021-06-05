import Core from '@idraw/core';
import { TypeCoreOptions, TypeConfig} from '@idraw/types';

// type Options = {} & TypeCoreOptions;

// const _opts = Symbol('_opts');

class IDraw extends Core {

  // private [_opts]: Options;

  constructor(mount: HTMLDivElement, opts: TypeCoreOptions, config: TypeConfig) {
    super(mount, {
      width: opts.width,
      height: opts.height,
      devicePixelRatio: opts.devicePixelRatio
    }, config);
    // this[_opts] = opts;
  }


}

export default IDraw;