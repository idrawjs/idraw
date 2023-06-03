// Thanks to: https://github.com/tomkp/react-split-pane/blob/master/src/Resizer.js
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from 'react';
import { createPrefixName } from '../../css';

const modName = 'mod-split-pane';

const prefixName = createPrefixName(modName);

export const RESIZER_DEFAULT_CLASSNAME = prefixName();

class Resizer extends React.Component {
  render() {
    const { className, onClick, onDoubleClick, onMouseDown, onTouchEnd, onTouchStart, resizerClassName = RESIZER_DEFAULT_CLASSNAME, split, style } = this.props;
    const classes = [resizerClassName, split, className];

    return (
      <span
        role="presentation"
        className={classes.join(' ')}
        style={style}
        onMouseDown={(event) => onMouseDown(event)}
        onTouchStart={(event) => {
          event.preventDefault();
          onTouchStart(event);
        }}
        onTouchEnd={(event) => {
          event.preventDefault();
          onTouchEnd(event);
        }}
        onClick={(event) => {
          if (onClick) {
            event.preventDefault();
            onClick(event);
          }
        }}
        onDoubleClick={(event) => {
          if (onDoubleClick) {
            event.preventDefault();
            onDoubleClick(event);
          }
        }}
      />
    );
  }
}

// Resizer.propTypes = {
//   className: PropTypes.string.isRequired,
//   onClick: PropTypes.func,
//   onDoubleClick: PropTypes.func,
//   onMouseDown: PropTypes.func.isRequired,
//   onTouchStart: PropTypes.func.isRequired,
//   onTouchEnd: PropTypes.func.isRequired,
//   split: PropTypes.oneOf(['vertical', 'horizontal']),
//   style: stylePropType,
//   resizerClassName: PropTypes.string.isRequired,
// };
// Resizer.defaultProps = {
//   resizerClassName: RESIZER_DEFAULT_CLASSNAME,
// };

export default Resizer;
