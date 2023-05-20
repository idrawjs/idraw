import React from 'react';
import { Sketch } from './modules';
import './css/index.less';

export const Lab = () => {
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, width: '100%', height: '100%' }}>
      <Sketch />
    </div>
  );
};
