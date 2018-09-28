import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import BOARD_CONSTANTS from './boardConstants'


class BoardSquare extends Component {
  static propTypes = {
    boardSize: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    color: PropTypes.number,
    nextMoveColor: PropTypes.number.isRequired,
  };

  static defaultProps = {
    color: 0,
  }

  render() {
    const { boardSize, x, y, color, nextMoveColor } = this.props;
    const squareClassNames = classnames('square', {
      firstrow: x === 0,
      lastrow: x === boardSize-1,
      firstcol: y === 0,
      lastcol: y === boardSize-1,
    })
    const stoneClassNames = classnames('stone', {
      blank: color !== BOARD_CONSTANTS.BLACK && color !== BOARD_CONSTANTS.WHITE,
      black: color === BOARD_CONSTANTS.BLACK,
      white: color === BOARD_CONSTANTS.WHITE,
      nextblack: nextMoveColor === BOARD_CONSTANTS.BLACK,
      nextwhite: nextMoveColor === BOARD_CONSTANTS.WHITE,
    })
    return (
      <div className={squareClassNames}>
        <div className="horiz-grid" />
        <div className="vert-grid" />
        <div className={stoneClassNames} />
      </div>
    );
  }
}

export default BoardSquare;
