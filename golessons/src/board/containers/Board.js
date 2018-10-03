import { connect } from 'react-redux';
import { addStone, back, forward, initialize } from '../actions';

import Board from '../Board.react';

const mapStateToProps = state => {
  return {
    board: state.boardReducer.board,
    nextMoveColor: state.boardReducer.nextMoveColor,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addStone: (x, y) => {
      dispatch(addStone({x, y}))
    },
    back: () => dispatch(back()),
    forward: () => dispatch(forward()),
    initialize: (initialStones, boardSize) => {
      dispatch(initialize(initialStones, boardSize))
    }
  }
}

const ConnectedBoard = connect(
  mapStateToProps,
  mapDispatchToProps
)(Board)

export default ConnectedBoard;
