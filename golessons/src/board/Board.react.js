import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _map from 'lodash/map';

import { PAD } from './boardConstants';
import BoardSquare from './BoardSquare.react';

import './board.css';


class Board extends Component {
  static propTypes = {
    // redux state
    board: PropTypes.array,
    boardSize: PropTypes.number,
    comment: PropTypes.string,
    nextMoveColor: PropTypes.number,

    // redux dispatch
    addStone: PropTypes.func,
    back: PropTypes.func,
    forward: PropTypes.func,
    initialize: PropTypes.func,
  };

  state = {
    gameTree: {},
    message: "Loading..."
  }

  reset = () => {
    this.props.initialize(this.state.gameTree);
    this.setState({ message: "Loaded!" });
  };

  componentDidMount() {
    fetch('api/something')
      .then((response) => {
        if (response.ok) {
            response.json().then(gameTree => {
              this.setState({ gameTree }, this.reset);
            });
        }
      })
      .catch((error) => {
        this.setState({ response: error });
      });
  }

  render() {
    const {
      addStone,
      back,
      board,
      boardSize,
      comment,
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
      <div className="board-container">
        <span> {this.state.message} </span>
        <span onClick={back}>Back</span>
        <span onClick={forward}>Forward</span>
        <span onClick={this.reset}>Reset</span>
        <div>{comment}</div>
        <div className="board">
          {boardSquares}
        </div>
      </div>
    );
  }
}

export default Board;
