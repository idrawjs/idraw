import React from 'react';
import classnames from 'classnames';
import { iconClassName } from './util';
import type { IconProps } from './util';

const More = (props: IconProps) => {
  const { className, style } = props;
  return (
    <span className={classnames([iconClassName, className])} style={style}>
      <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor">
        <path d="M512 42.666667a469.333333 469.333333 0 1 0 469.333333 469.333333A469.333333 469.333333 0 0 0 512 42.666667z m0 864a394.666667 394.666667 0 1 1 394.666667-394.666667 395.146667 395.146667 0 0 1-394.666667 394.666667z"></path>
        <path d="M304.906667 512m-66.666667 0a66.666667 66.666667 0 1 0 133.333333 0 66.666667 66.666667 0 1 0-133.333333 0Z"></path>
        <path d="M512 512m-66.666667 0a66.666667 66.666667 0 1 0 133.333334 0 66.666667 66.666667 0 1 0-133.333334 0Z"></path>
        <path d="M719.093333 512m-66.666666 0a66.666667 66.666667 0 1 0 133.333333 0 66.666667 66.666667 0 1 0-133.333333 0Z"></path>
      </svg>
    </span>
  );
};

export default More;
