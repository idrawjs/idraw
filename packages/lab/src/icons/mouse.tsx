import React from 'react';
import classnames from 'classnames';
import { iconClassName } from './util';
import type { IconProps } from './util';

const Mouse = (props: IconProps) => {
  const { className, style } = props;
  return (
    <span className={classnames([iconClassName, className])} style={style}>
      <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor">
        <path d="M570.3 939.6c-11.7 0-23-6.5-28.6-17.7l-95.2-190.1-137 102.7c-9.7 7.3-22.6 8.4-33.5 3-10.8-5.4-17.7-16.4-17.7-28.5l-2.7-672.9c-0.1-12.7 7.4-24.2 19-29.4 11.6-5.2 25.1-3 34.5 5.5l496.4 449.2c9 8.1 12.6 20.6 9.4 32.2-3.2 11.7-12.7 20.5-24.6 22.9l-165.5 33.1L717.2 834c3.8 7.6 4.4 16.4 1.8 24.4-2.7 8.1-8.5 14.7-16 18.5l-118.3 59.2c-4.7 2.5-9.6 3.5-14.4 3.5zM457.8 651.3c2.4 0 4.9 0.3 7.3 0.9 9.2 2.2 17 8.3 21.3 16.8l98.1 195.8 61.1-30.6-96.8-193.3c-4.5-8.9-4.5-19.4-0.1-28.4s12.7-15.4 22.5-17.3l144.3-28.9-395.6-357.9 2.1 536.7 116.6-87.4c5.6-4.2 12.4-6.4 19.2-6.4z"></path>
      </svg>
    </span>
  );
};

export default Mouse;
