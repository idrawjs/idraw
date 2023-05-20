import React, { useEffect, useRef } from 'react';
import { Core, MiddlewareScroller, MiddlewareSelector } from '@idraw/core';
import { calcElementsContextSize } from '@idraw/util';
import { getData } from './data';
import { Sketch } from './sketch';

export const Lab = () => {
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, width: '100%', height: '100%' }}>
      <Sketch />
    </div>
  );
};
