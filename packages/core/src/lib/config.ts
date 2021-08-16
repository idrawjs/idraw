import { TypeConfig, TypeConfigStrict } from '@idraw/types';
import util from '@idraw/util';

const defaultConfig: TypeConfigStrict = {
  elementWrapper: {
    color: '#2ab6f1',
    lockColor: '#aaaaaa',
    dotSize: 6,
    lineWidth: 1,
    lineDash: [4, 3],
  }
};

function mergeConfig(config?: TypeConfig): TypeConfigStrict {
  const result = util.data.deepClone(defaultConfig);
  if (config) {
    if (config.elementWrapper) {
      result.elementWrapper = {...result.elementWrapper, ...config.elementWrapper};
    }
  }
  return result;
}

export {
  mergeConfig,
};

