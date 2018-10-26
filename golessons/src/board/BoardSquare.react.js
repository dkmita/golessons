import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { BLACK, WHITE } from './boardConstants'


class BoardSquare extends Component {
  static propTypes = {
    addStone: PropTypes.func,
    boardSize: PropTypes.number.isRequired,
    color: PropTypes.number,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    nextMoveColor: PropTypes.number.isRequired,
  };

  static defaultProps = {
    color: 0,
  }

  render() {
    const { addStone, boardSize, x, y, color, nextMoveColor } = this.props;
    const squareClassNames = classnames('square', {
      firstcol: x === 0,
      lastcol: x === boardSize-1,
      firstrow: y === 0,
      lastrow: y === boardSize-1,
    });
    const stoneClassNames = classnames('stone', {
      blank: color !== BLACK && color !== WHITE,
      black: color === BLACK,
      white: color === WHITE,
      nextblack: nextMoveColor === BLACK,
      nextwhite: nextMoveColor === WHITE,
    });
    return (
      <div className={squareClassNames} onClick={() => addStone(x, y)}>
        <div className={stoneClassNames} />
      </div>
    );
  }
}

export default BoardSquare;
