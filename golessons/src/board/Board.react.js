import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _map from 'lodash/map';

import { PAD } from './boardConstants';
import getLocHash from './boardutil';
import BoardSquare from './BoardSquare.react';

import './board.css';


class Board extends Component {
  static propTypes = {
    // redux state
    board: PropTypes.array,
    boardSize: PropTypes.number,
    currentStone: PropTypes.object,
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
      //this.props.initialize({boardSize: 19})
  }

  render() {
    const {
      addStone,
      back,
      board,
      boardSize,
      currentStone,
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
        const locHash = getLocHash({ x: colIdx, y: rowIdx });
        const isNextMove = !!(currentStone.nextStones && currentStone.nextStones[locHash]);
        return (
          <BoardSquare
            key={`${colIdx}_${rowIdx}`}
            addStone={addStone}
            boardSize={boardSize}
            isNextMove={isNextMove}
            nextMoveColor={nextMoveColor}
            x={colIdx}
            y={rowIdx}
            color={color}
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
        <div className="board">
          {boardSquares}
        </div>
        <div>{currentStone ? currentStone.comment : ''}</div>
      </div>
    );
  }
}

export default Board;
