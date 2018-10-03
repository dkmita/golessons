import { combineReducers } from 'redux'
import _forEach from 'lodash/forEach';
import _values from 'lodash/values';

import {
  ADD_STONE,
  BACK,
  FORWARD,
  INITIALIZE,
} from './actions'
import {
  BLACK,
  WHITE,
} from './boardConstants';

const defaultState = {
  board: [[undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined]],
  currentStone: undefined,
  nextStoneId: 0,
  nextMoveColor: BLACK,
  stones: {},
}

const getNextIndex = (stone) => {
  const { x, y } = stone;
  return x * 100 + y;
}

const isInvalidOrVisitedLocation = (loc, visitedStones, boardSize) => {
  if (visitedStones[getNextIndex(loc)]) {
    return true;
  }
  if (loc.x < 0 || loc.x >= boardSize
      || loc.y < 0 || loc.y >= boardSize) {
    return true;
  }
  return false;
}

const getAdjacentLocations = (loc) => {
  return [
    { x: loc.x - 1, y: loc.y },
    { x: loc.x, y: loc.y - 1 },
    { x: loc.x + 1, y: loc.y },
    { x: loc.x, y: loc.y + 1 },
  ]
}

const calcRemovedStones = (board, boardSize, addedStone) => {
  let removedStones = [];
  const adjacent = getAdjacentLocations(addedStone);
  const capturingStoneColor = addedStone.color;
  const visitedStones = {[getNextIndex(addedStone)]: addedStone};
  _forEach(adjacent, (location) => {
    if (isInvalidOrVisitedLocation(location, visitedStones, boardSize)) {
      return;
    }
    const color = board[location.y][location.x];
    if (!color || color === capturingStoneColor) {
      return;
    }
    const currentStoneGroup = [location];
    const locationsToCheck = [location];
    let foundLiberty = false;

    const checkLocation = (loc) => {
      if (isInvalidOrVisitedLocation(loc, visitedStones, boardSize)) {
        return;
      }
      const color = board[loc.y][loc.x];
      if (!color) {
        foundLiberty = true;
        return;
      }
      else {
        if (color !== capturingStoneColor) {
          locationsToCheck.push(loc);
          currentStoneGroup.push(loc);
        }
        visitedStones[getNextIndex(loc)] = 1;
      }
    }

    while (locationsToCheck.length > 0) {
      _forEach(getAdjacentLocations(locationsToCheck[0]), checkLocation);
      if (foundLiberty) {
        return;
      }
      locationsToCheck.shift();
    }
    removedStones.push(...currentStoneGroup);
  });
  return removedStones;
}

function boardReducer(state = {defaultState}, action) {
  switch (action.type) {
    case ADD_STONE:
      const stone = action.stone;
      if (state.board[stone.y][stone.x]) {
        return state;
      }
      if (stone.x >= state.board.length || stone.y >= state.board.length
          || stone.x < 0 || stone.y < 0) {
        return state;
      }

      let addedStone = stone;
      let nextStoneId = state.nextStoneId;
      if (!state.currentStone.nextStones) {
        state.currentStone.nextStones = {};
      }
      const prevNextStones = state.currentStone.nextStones;
      if (prevNextStones && prevNextStones[getNextIndex(stone)]) {
        addedStone = prevNextStones[getNextIndex(stone)];
      }
      else {
        addedStone.color = state.nextMoveColor;
        addedStone.id = nextStoneId++;
        addedStone.removedStones = calcRemovedStones(state.board, state.boardSize, addedStone);;
        addedStone.previousStone = state.currentStone;
        state.stones[addedStone.id] = addedStone;
        prevNextStones[getNextIndex(addedStone)] = addedStone;
      }
      addedStone.lastSeen = (new Date()).getTime();
      _forEach(addedStone.removedStones, (removedStone) => {
        state.board[removedStone.y][removedStone.x] = undefined;
      });
      state.board[addedStone.y][addedStone.x] = addedStone.color;
      return Object.assign({}, state,
        {
          currentStone: addedStone,
          nextStoneId: nextStoneId,
          nextMoveColor: state.currentStone.color,
        }
      );

    case BACK:
      if (!state.currentStone.previousStone) {
        return state;
      }
      state.board[state.currentStone.y][state.currentStone.x] = undefined;
      _forEach(state.currentStone.removedStones, (removedStone) => {
        state.board[removedStone.y][removedStone.x] = state.currentStone.previousStone.color;
      });
      return Object.assign({}, state,
        {
          currentStone: state.currentStone.previousStone,
          nextMoveColor: state.currentStone.color,
        }
      );

    case FORWARD:

      if (!state.currentStone.nextStones) {
        return state;
      }
      const nextStone = _values(state.currentStone.nextStones)
        .reduce((move1, move2) => (move1.lastSeen > move2.lastSeen) ? move1 : move2);
      _forEach(nextStone.removedStones, (removedStone) => {
        state.board[removedStone.y][removedStone.x] = undefined;
      });
      state.board[nextStone.y][nextStone.x] = nextStone.color;
      return Object.assign({}, state,
        {
          currentStone: nextStone,
          nextMoveColor: state.currentStone.color,
        }
      );

    case INITIALIZE:
      const { initialStones, boardSize } = action;
      const board = new Array(boardSize);
      for (let i = 0; i < boardSize; i++) {
        board[i] = new Array(boardSize);
      }

      const stones = { 0: { id: 0, color: WHITE } }; // root of tree
      let stoneId = 1;
      _forEach(initialStones, (stone) => {
        stone.id = stoneId++;
        stones[stone.id] = stone;
        const { x, y, color } = stone;
        board[y][x] = color;
      });

      return {
        board: board,
        boardSize: boardSize,
        currentStone: stones[0],
        nextStoneId: stoneId,
        nextMoveColor: BLACK,
        stones: stones,
      };
    default:
      return state;
  }
}

const boardReducers = combineReducers({
  boardReducer,
});

export default boardReducers;