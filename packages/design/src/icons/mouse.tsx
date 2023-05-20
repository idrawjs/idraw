import React, { CSSProperties } from 'react';

const Mouse = (props: { className?: string; style?: CSSProperties }) => {
  const { className, style } = props;
  return (
    <span className={className} style={style}>
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
        <path d="M21 3 3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"></path>
      </svg>
    </span>
  );
};

export default Mouse;
