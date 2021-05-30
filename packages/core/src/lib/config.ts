import { TypeConfig, TypeConfigStrict } from '@idraw/types';

const defaultConfig: TypeConfigStrict = {
  elementWrapper: {
    color: '#2ab6f1',
    dotSize: 8,
    lineWidth: 1,
    lineDash: [4, 3],
  }
};

function mergeConfig(config?: TypeConfig): TypeConfigStrict {
  const result = defaultConfig;
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

