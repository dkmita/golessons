import { connect } from 'react-redux';
import { addStone, back, forward, initialize } from '../actions';

import Board from '../Board.react';

const mapStateToProps = state => {
  return {
    board: state.boardReducer.board,
    boardSize: state.boardReducer.boardSize,
    comment: state.boardReducer.comment,
    nextMoveColor: state.boardReducer.nextMoveColor,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addStone: (x, y) => dispatch(addStone({x, y})),
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
