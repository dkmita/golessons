import { connect } from 'react-redux';
import { addStone, addLabel } from '../actions';

import BoardSquare from '../BoardSquare.react';


const mapDispatchToProps = dispatch => {
  return {
    addStone: (x, y, color) => dispatch(addStone({x, y, color})),
    addLabel: (x, y, type) => dispatch(addLabel({x, y, type})),
  }
}

const ConnectedBoardSquare = connect(
  null,
  mapDispatchToProps
)(BoardSquare)

export default ConnectedBoardSquare;
