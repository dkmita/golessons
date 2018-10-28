import { combineReducers } from 'redux'
import _forEach from 'lodash/forEach';
import _values from 'lodash/values';
import _filter from 'lodash/filter';
import getLocHash from './boardutil';

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
  board: [[]],
  boardSize: 0,
  comment: '',
  currentStone: undefined,
  nextStoneId: 0,
  nextMoveColor: BLACK,
  stones: {},
}

const isValidLocation = (loc, boardSize) => {
  return loc.x >= 0 && loc.x < boardSize
      && loc.y >= 0 && loc.y < boardSize;
};

const getAdjacentLocations = (loc) => {
  return [
    { x: loc.x - 1, y: loc.y },
    { x: loc.x, y: loc.y - 1 },
    { x: loc.x + 1, y: loc.y },
    { x: loc.x, y: loc.y + 1 },
  ]
};

// returns a list of the stones in the group if it has no liberties
const getGroupIfNoLiberties = (board, stone, groupColor) => {
  const visitedStones = new Set();
  if (!isValidLocation(stone, board.length)) {
    return [];
  }
  const currentStoneGroup = [stone];
  const locationsToCheck = [stone];
  let foundLiberty = false;

  const checkLocation = (loc) => {
    if (!isValidLocation(loc, board.length) || visitedStones.has(getLocHash(loc))) {
      return;
    }
    const color = board[loc.y][loc.x];
    if (!color) {
      foundLiberty = true;
      return;
    }
    else {
      if (color === groupColor) {
        locationsToCheck.push(loc);
        currentStoneGroup.push(loc);
      }
      visitedStones.add(getLocHash(loc));
    }
  }

  while (locationsToCheck.length > 0) {
    _forEach(getAdjacentLocations(locationsToCheck[0]), checkLocation);
    if (foundLiberty) {
      return [];
    }
    locationsToCheck.shift();
  }
  return currentStoneGroup;
};

const calcCapturedStones = (board, addedStone) => {
  let capturedStones = [];
  const adjacent = getAdjacentLocations(addedStone);
  _forEach(adjacent, (location) => {
    if (!isValidLocation(location, board.length)) {
      return;
    }
    const color = board[location.y][location.x];
    if (!color || color === addedStone.color) {
      return;
    }
    capturedStones.push(...getGroupIfNoLiberties(board, location, color));
  });
  return capturedStones;
}

const addGameTree = (board, currentStone, nextStoneId, treeNode, stones) => {
  const addedStone = addStone(board, currentStone, nextStoneId, treeNode, stones, true);
  nextStoneId = (addedStone && (addedStone.id === nextStoneId)) ? nextStoneId+1 : nextStoneId;
  _forEach(treeNode.children, (child) => {
    nextStoneId = addGameTree(board, addedStone, nextStoneId, child, stones);
  });
  back(board, addedStone);
  return nextStoneId;
}

const addStone = (board, currentStone, nextStoneId, stone, stones, isInitialization) => {
  if (board[stone.y][stone.x]) {
    return null;
  }
  if (stone.x >= board.length || stone.y >= board.length
      || stone.x < 0 || stone.y < 0) {
    return null;
  }

  board[stone.y][stone.x] = stone.color;
  if (!currentStone.nextStones) {
    currentStone.nextStones = {};
  }

  // determine whether we've already seen this move and create a new stone if not
  if (currentStone.nextStones && currentStone.nextStones[getLocHash(stone)]) {
    stone = currentStone.nextStones[getLocHash(stone)];
  }
  else {
    stone.id = nextStoneId;
    stone.capturedStones = calcCapturedStones(board, stone);;
    stone.previousStone = currentStone;
    stones[stone.id] = stone;
    currentStone.nextStones[getLocHash(stone)] = stone;
    if (isInitialization) {
      stone.isInitial = true;
    }
  }
  stone.lastSeen = (new Date()).getTime();

  // update the board
  _forEach(stone.capturedStones, (removedStone) => {
    board[removedStone.y][removedStone.x] = undefined;
  });
  return stone;
}

const back = (board, currentStone, removeHistory = false) => {
  if (!currentStone.previousStone) {
    return null;
  }
  if (removeHistory) {
    delete currentStone.previousStone.nextStones[getLocHash(currentStone)];
  }
  board[currentStone.y][currentStone.x] = undefined;
  _forEach(currentStone.capturedStones, (capturedStone) => {
    board[capturedStone.y][capturedStone.x] = currentStone.previousStone.color;
  });
}

function boardReducer(state = {defaultState}, action) {
  switch (action.type) {
    case ADD_STONE:
      let addedStone = addStone(state.board, state.currentStone, state.nextStoneId, action.stone, state.stones)
      if (!addedStone) {
        return state;
      }
      if (getGroupIfNoLiberties(state.board, addedStone, addedStone.color).length > 0) {
        back(state.board, addedStone, true);
        return Object.assign({}, state, { error: "Move is suicidal" });
      }
      const nextInitialStones = _filter(addedStone.nextStones, (stone) => stone.isInitial);
      if (nextInitialStones.length > 0) {
        const randomNextStone = nextInitialStones[Math.floor(Math.random() * nextInitialStones.length)];
        addedStone = addStone(state.board, addedStone, state.nextStoneId, randomNextStone, state.stones)
      }
      return Object.assign({}, state,
        {
          currentStone: addedStone,
          nextStoneId: addedStone.id === state.nextStoneId ? state.nextStoneId+1 : state.nextStoneId,
          nextMoveColor: addedStone.color === BLACK ? WHITE : BLACK,
        }
      );

    case BACK:
      back(state.board, state.currentStone);
      if (!state.currentStone.previousStone) {
        return state;
      }
      return Object.assign({}, state,
        {
          currentStone: state.currentStone.previousStone,
          nextMoveColor: state.currentStone.color,
        }
      );

    case FORWARD:
      if (!state.currentStone.nextStones || Object.keys(state.currentStone.nextStones).length === 0) {
        return state;
      }
      const nextStone = _values(state.currentStone.nextStones)
        .reduce((move1, move2) => (move1.lastSeen > move2.lastSeen) ? move1 : move2);
      _forEach(nextStone.capturedStones, (removedStone) => {
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
      const { gameTree } = action;
      const board = new Array(gameTree.boardSize);
      for (let i = 0; i < gameTree.boardSize; i++) {
        board[i] = new Array(gameTree.boardSize);
      }

      const currentStone = { id: 0, color: WHITE, comment: gameTree.comment }
      const stones = { 0: currentStone }; // root of tree
      let nextStoneId = 1;
      _forEach(gameTree.addedStones, (stone) => {
        stone.id = nextStoneId++;
        stones[stone.id] = stone;
        const { x, y, color } = stone;
        board[y][x] = color;
      });

      _forEach(gameTree.children, (child) => {
        nextStoneId = addGameTree(board, currentStone, nextStoneId, child, stones);
      });

      return {
        board: board,
        boardSize: gameTree.boardSize,
        currentStone: stones[0],
        nextStoneId: nextStoneId,
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