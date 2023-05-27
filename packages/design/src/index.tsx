import React, { useEffect, useState } from 'react';
import { Sketch } from './modules';
import type { SketchProps } from './modules';
import { Provider, createDesignContextValue } from './context';
import type { DesignContext } from './context';
import type { DesignData } from './types';
import './css/index.less';

export type DesignProps = SketchProps & {
  data?: DesignData;
  locale?: string; // TODO
};

export const Design = (props: DesignProps) => {
  const { width = 1000, height = 600, style, className, data } = props;
  const [contextValue, setContextValue] = useState<DesignContext>(createDesignContextValue({ data }));

  useEffect(() => {
    if (data) {
      setContextValue({ ...contextValue, ...{ data } });
    }
  }, [data]);

  return (
    <Provider value={contextValue}>
      <Sketch width={width} height={height} style={style} className={className} />
    </Provider>
  );
};

export * from './types';
