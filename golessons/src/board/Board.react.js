import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _map from 'lodash/map';

import { PAD } from './boardConstants';
import BoardSquare from './BoardSquare.react';

import './board.css';


class Board extends Component {
  static propTypes = {
    addStone: PropTypes.function,
    back: PropTypes.function,
    board: PropTypes.array,
    boardSize: PropTypes.number,
    forward: PropTypes.function,
    initialize: PropTypes.function,
    initialStones: PropTypes.array,
    nextMoveColor: PropTypes.number,
  };

  reset = () => {
    const { boardSize, initialize, initialStones } = this.props;
    initialize(initialStones, boardSize);
  };

  componentDidMount() {
    this.reset();
  }

  render() {
    const {
      addStone,
      back,
      board,
      boardSize,
      forward,
      nextMoveColor } = this.props;

    const minX = 0;
    const maxX = 20;
    const minY = 0;
    const maxY = 20;

    const boardSquares = _map(board, (row, rowIdx) => {
      const rowSquares = _map(row, (color, colIdx) => {
        if (colIdx < minX - PAD || colIdx > maxX + PAD ||
            rowIdx < minY - PAD || rowIdx > maxY + PAD) {
          return null;
        }
        return (
          <BoardSquare
            key={`${colIdx}_${rowIdx}`}
            addStone={addStone}
            boardSize={boardSize}
            x={colIdx}
            y={rowIdx}
            color={color}
            nextMoveColor={nextMoveColor}
          />
        );
      });
      return (
        <div className="board-row" key={rowIdx}>
          {rowSquares}
        </div>
      );
    });


    return (
      <div className="board">
        <div onClick={back}>Back</div>
        <div onClick={forward}>Forward</div>
        <div onClick={this.reset}>Reset</div>
        {boardSquares}
      </div>
    );
  }
}

export default Board;
