import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { BLACK, WHITE, STONE_MODE } from './boardConstants'


class BoardSquare extends Component {
  static propTypes = {
    boardSize: PropTypes.number.isRequired,
    color: PropTypes.number,
    isCurrentStone: PropTypes.bool.isRequired,
    isNextMove: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    nextMoveColor: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,

    // redux dispatch
    addLabel: PropTypes.func,
    addStone: PropTypes.func,
  };

  static defaultProps = {
    color: 0,
    label: '',
  }

  onClick = (x, y) => {
    const { mode, addLabel, addStone, nextMoveColor } = this.props;
    if (mode === STONE_MODE) {
      addStone(x, y, nextMoveColor);
    }
    else {
      addLabel(x, y, mode);
    }
  };

  render() {
    const {
      boardSize,
      color,
      isCurrentStone,
      isNextMove,
      label,
      mode,
      nextMoveColor,
      x,
      y,
    } = this.props;
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
      nextmove: isNextMove,
      stonemode: mode === STONE_MODE,
    });
    const mark = isCurrentStone ? 'O' : label;
    return (
      <div className={squareClassNames} onClick={() => this.onClick(x, y)}>
        <div className={stoneClassNames}>{mark}</div>
      </div>
    );
  }
}

export default BoardSquare;
