import { connect } from 'react-redux';
import { addStone, back, forward, initialize, setInitBoard, updateComment } from '../actions';

import Board from '../Board.react';

const mapStateToProps = state => {
  return {
    board: state.boardReducer.board,
    boardSize: state.boardReducer.boardSize,
    currentStone: state.boardReducer.currentStone,
    currentLabels: state.boardReducer.currentLabels,
    error: state.boardReducer.error,
    nextMoveColor: state.boardReducer.nextMoveColor,
    rootStone: state.boardReducer.rootStone,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addStone: (x, y, color) => dispatch(addStone({x, y, color})),
    back: (shouldRemove) => dispatch(back(shouldRemove)),
    forward: () => dispatch(forward()),
    initialize: (gameTree) => dispatch(initialize(gameTree)),
    setInitBoard: (nextMoveColor) => dispatch(setInitBoard(nextMoveColor)),
    updateComment: (comment) => dispatch(updateComment(comment)),
  }
}

const ConnectedBoard = connect(
  mapStateToProps,
  mapDispatchToProps
)(Board)

export default ConnectedBoard;
