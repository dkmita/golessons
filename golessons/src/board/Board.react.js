import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _forEach from 'lodash/forEach';
import _map from 'lodash/map';

import BoardSquare from './BoardSquare.react';
import BOARD_CONSTANTS from './boardConstants'

import './board.css';


class Board extends Component {
  static propTypes = {
    boardSize: PropTypes.number,
    initialStones: PropTypes.array,
    nextMoveColor: PropTypes.number,
  };

  static defaultProps = {
    boardSize: 19,
    initialStones: [],
    nextMoveColor: BOARD_CONSTANTS.BLACK,
  };

  state = {
    board: [[]],
  };

  componentDidMount() {
    const { boardSize, initialStones } = this.props;
    var board = new Array(boardSize);
    for (var i = 0; i < boardSize; i++) {
      board[i] = new Array(boardSize);
    }

    let minX = boardSize;
    let maxX = -1;
    let minY = boardSize;
    let maxY = -1;

    _forEach(initialStones, (stone) => {
      const { x, y, color } = stone;
      board[y][x] = color;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    this.setState({
      board: board,
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
    });
  }

  render() {
    const { boardSize, nextMoveColor } = this.props;
    const { board, minX, maxX, minY, maxY } = this.state;
    const boardSquares = _map(board, (row, rowIdx) => {
      const rowSquares = _map(row, (color, colIdx) => {
        if (colIdx < minX - BOARD_CONSTANTS.PAD || colIdx > maxX + BOARD_CONSTANTS.PAD ||
            rowIdx < minY - BOARD_CONSTANTS.PAD || rowIdx > maxY + BOARD_CONSTANTS.PAD) {
          return null;
        }
        return (
          <BoardSquare
            key={`${colIdx}_${rowIdx}`}
            boardSize={boardSize}
            x={rowIdx}
            y={colIdx}
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
        {boardSquares}
      </div>
    );
  }
}

export default Board;
