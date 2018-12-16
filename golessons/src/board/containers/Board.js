import { connect } from 'react-redux';
import { addStone, back, forward, initialize } from '../actions';

import Board from '../Board.react';

const mapStateToProps = state => {
  return {
    board: state.boardReducer.board,
    boardSize: state.boardReducer.boardSize,
    currentStone: state.boardReducer.currentStone,
    nextMoveColor: state.boardReducer.nextMoveColor,
    error: state.boardReducer.error,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addStone: (x, y, color) => dispatch(addStone({x, y, color})),
    back: () => dispatch(back()),
    forward: () => dispatch(forward()),
    initialize: (gameTree) => dispatch(initialize(gameTree)),
  }
}

const ConnectedBoard = connect(
  mapStateToProps,
  mapDispatchToProps
)(Board)

export default ConnectedBoard;
