import React, { Component } from 'react';
import PropTypes from 'prop-types';

import _map from 'lodash/map';

import { PAD } from './boardConstants';
import { getLocHash, simplifyGameTree } from './boardutil';
import BoardSquare from './BoardSquare.react';

import './board.css';


class Board extends Component {
  static propTypes = {
    id: PropTypes.number,

    // redux state
    board: PropTypes.array,
    boardSize: PropTypes.number,
    currentStone: PropTypes.object,
    error: PropTypes.string,
    nextMoveColor: PropTypes.number,
    rootStone: PropTypes.object,

    // redux dispatch
    addStone: PropTypes.func,
    back: PropTypes.func,
    forward: PropTypes.func,
    initialize: PropTypes.func,
    updateComment: PropTypes.func,
  };

  state = {
    gameTree: {},
    message: "Loading..."
  }

  reset = () => {
    this.props.initialize(this.state.gameTree);
    this.setState({ message: "Loaded!" });
  };

  loadData = (lessonName) => {
    const apiUrl = lessonName ? `api/lesson/${lessonName}/` : `api/problem/${this.props.id}/`
    fetch(apiUrl).then((response) => {
        if (response.ok) {
            response.json().then(gameTree => {
              this.setState({ gameTree }, this.reset);
            });
        }
      })
      .catch((error) => {
        this.setState({ response: error });
      });
  };

  saveLesson = () => {
    const simplifiedGameTree = simplifyGameTree(this.props.rootStone);
    fetch(`api/save-lesson`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        lessonName: "first-lesson",
        lessonJson: JSON.stringify(simplifiedGameTree)
      })
    })
      .then((response) => {
        if (response.ok) {
          this.setState({ message: "Saved!" });
        }
      })
      .catch((error) => {
        this.setState({ message: "Error saving" });
      });
  };

  updateComment = (evt) => {
    this.props.updateComment(evt.target.value);
  };

  componentDidMount() {
    this.loadData();
  };

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      this.loadData();
    }
  }

  render() {
    const {
      addStone,
      back,
      board,
      boardSize,
      currentStone,
      error,
      forward,
      nextMoveColor,
    } = this.props;

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
            label={currentStone.labels ? currentStone.labels[locHash] : ''}
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
        <div>
          <span> {this.state.message} </span>
          <span onClick={() => back(false)}>Back</span>
          <span onClick={forward}>Forward</span>
          <span onClick={this.reset}>Reset</span>
        </div>
        <div>
          <span onClick={this.saveLesson}>Save</span>
          <span onClick={() => this.loadData('first-lesson')}>Load</span>
          <span onClick={() => back(true)}>Delete</span>
        </div>
        <div className="board">
          {boardSquares}
        </div>
        <div>
          <input type="textbox"
            placeholder={currentStone ? currentStone.comment : ''}
            onChange={this.updateComment}
            />
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }
}

export default Board;
