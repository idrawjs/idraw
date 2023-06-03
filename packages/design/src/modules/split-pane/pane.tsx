// Thanks to: https://github.com/tomkp/react-split-pane/blob/master/src/Pane.js
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from 'react';

class Pane extends React.PureComponent {
  render() {
    const { children, className, split, style: styleProps, size, eleRef } = this.props;

    const classes = ['Pane', split, className];

    let style = {
      flex: 1,
      position: 'relative',
      outline: 'none'
    };

    if (size !== undefined) {
      if (split === 'vertical') {
        style.width = size;
      } else {
        style.height = size;
        style.display = 'flex';
      }
      style.flex = 'none';
    }

    style = Object.assign({}, style, styleProps || {});

    return (
      <div ref={eleRef} className={classes.join(' ')} style={style}>
        {children}
      </div>
    );
  }
}

// Pane.propTypes = {
//   className: PropTypes.string.isRequired,
//   children: PropTypes.node.isRequired,
//   size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   split: PropTypes.oneOf(['vertical', 'horizontal']),
//   style: stylePropType,
//   eleRef: PropTypes.func,
// };

// Pane.defaultProps = {};

export default Pane;
