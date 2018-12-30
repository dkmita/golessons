import React, { Component } from 'react';
import PropTypes from 'prop-types';

import _map from 'lodash/map';

import {
  BLACK,
  WHITE,
  PAD,
  A_MODE,
  B_MODE,
  C_MODE,
  SQ_MODE,
  STONE_MODE,
  TR_MODE,
  X_MODE
} from './boardConstants';
import { getLocHash, simplifyGameTree } from './boardutil';
import BoardSquare from './containers/BoardSquare';

import './board.css';


class Board extends Component {
  static propTypes = {
    id: PropTypes.number,

    // redux state
    board: PropTypes.array,
    boardSize: PropTypes.number,
    currentLabels: PropTypes.object,
    currentStone: PropTypes.object,
    error: PropTypes.string,
    nextMoveColor: PropTypes.number,
    rootStone: PropTypes.object,

    // redux dispatch
    back: PropTypes.func,
    forward: PropTypes.func,
    initialize: PropTypes.func,
    setInitBoard: PropTypes.func,
    updateComment: PropTypes.func,
  };

  state = {
    comment: '',
    lessonName: '',
    gameTree: {},
    message: "Loading...",
    mode: STONE_MODE,
    nextOverride: undefined,
  }

  reset = () => {
    this.props.initialize(this.state.gameTree);
    this.setState({ message: "Loaded!" });
  };

  loadData = () => {
    const { lessonName } = this.state;
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
    const { lessonName } = this.state;
    if (!lessonName) {
      this.setState({ message: "Please provide a lesson name"})
      return;
    }
    const simplifiedGameTree = simplifyGameTree(this.props.rootStone);
    fetch(`api/save-lesson`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        lessonName: this.state.lessonName,
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

  setMode = (mode) => () => {
    this.setState({
      mode,
      nextOverride: undefined
    });
  };

  setNextOverride = (color) => () => {
    this.setState({
      mode: STONE_MODE,
      nextOverride: color,
    });
  };

  setInitBoard = (nextMoveColor) => () => {
    this.props.setInitBoard(nextMoveColor);
    this.saveLesson();
  }

  updateComment = (evt) => {
    const comment = evt.target.value;
    this.setState({ comment })
    this.props.updateComment(comment);
  };

  updateLessonName = (evt) => {
    const lessonName = evt.target.value;
    this.setState({ lessonName })
  };

  componentDidMount() {
    this.loadData();
  };

  componentDidUpdate(prevProps) {
    const { id, currentStone } = this.props;

    if (id !== prevProps.id) {
      this.setState({ lessonName: ''}, this.loadData);
    }

    if (currentStone !== prevProps.currentStone) {
      this.setState({ comment: (currentStone && currentStone.comment) ? currentStone.comment : '' });
    }
  }

  render() {
    const {
      comment,
      lessonName,
      message,
      mode,
      nextOverride
    } = this.state;

    const {
      back,
      board,
      boardSize,
      currentLabels,
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
            boardSize={boardSize}
            isCurrentStone={currentStone.x === colIdx && currentStone.y === rowIdx}
            isNextMove={isNextMove}
            label={currentLabels ? currentLabels[locHash] : ''}
            mode={mode}
            nextMoveColor={nextOverride || nextMoveColor}
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
          <span onClick={this.saveLesson}>Save</span>
          <span onClick={() => this.loadData('first-lesson')}>Load</span>
          <span><input type="text"
            value={lessonName}
            onChange={this.updateLessonName}
          /></span>
        </div>
        <br />
        <div>
          <span>{`<${mode}>`}</span>
          <span onClick={this.setMode(STONE_MODE)}>Stone</span>
          <span onClick={this.setNextOverride(BLACK)}>BL</span>
          <span onClick={this.setNextOverride(WHITE)}>WH</span>
          <span onClick={this.setMode(A_MODE)}>A</span>
          <span onClick={this.setMode(B_MODE)}>B</span>
          <span onClick={this.setMode(C_MODE)}>C</span>
          <span onClick={this.setMode(SQ_MODE)}>SQ</span>
          <span onClick={this.setMode(TR_MODE)}>TR</span>
          <span onClick={this.setMode(X_MODE)}>X</span>
        </div>
        <div>
          <span onClick={() => back(false)}>Back</span>
          <span onClick={forward}>Forward</span>
          <span onClick={this.reset}>Reset</span>
          <span onClick={() => back(true)}>Delete</span>
          <span onClick={this.setInitBoard(nextOverride || nextMoveColor)}>Set</span>
        </div>
        <div className="board">
          {boardSquares}
        </div>
        <div>
          <textarea rows="4" cols="75"
            value={comment}
            onChange={this.updateComment}
            />
        </div>
        <div className="error">{error}</div>
        <span> {message} </span>
      </div>
    );
  }
}

export default Board;
