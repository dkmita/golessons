import { combineReducers } from 'redux'
import _forEach from 'lodash/forEach';
import _values from 'lodash/values';
import _filter from 'lodash/filter';
import { getLocHash } from './boardutil';

import {
  ADD_LABEL,
  ADD_STONE,
  BACK,
  FORWARD,
  INITIALIZE,
  SET_INIT_BOARD,
  UPDATE_COMMENT,
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
  labels: undefined,
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
  if (!addedStone) {
    return nextStoneId;
  }
  nextStoneId = (addedStone.id === nextStoneId) ? nextStoneId+1 : nextStoneId;
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
    const capturedStones = calcCapturedStones(board, stone);
    if (capturedStones.length) {
      stone.capturedStones = capturedStones;
    }
    stone.id = nextStoneId;
    stone.previousStone = currentStone;
    stones[stone.id] = stone;
    currentStone.nextStones[getLocHash(stone)] = stone;
    if (isInitialization) {
      stone.isInitial = true;
    }
  }
  stone.lastSeen = (new Date()).getTime();

  // update the board
  _forEach(stone.capturedStones, (capturedStone) => {
    board[capturedStone.y][capturedStone.x] = undefined;
  });
  return stone;
}

const back = (board, currentStone, remove = false) => {
  if (!currentStone.previousStone) {
    return null;
  }
  if (remove) {
    delete currentStone.previousStone.nextStones[getLocHash(currentStone)];
  }
  board[currentStone.y][currentStone.x] = undefined;
  _forEach(currentStone.capturedStones, (capturedStone) => {
    board[capturedStone.y][capturedStone.x] = currentStone.previousStone.color;
  });
}

const isKo = (lastStone, newStone) => {
  const lastCapturedStones = lastStone.capturedStones;
  const newCapturedStones = newStone.capturedStones;
  if (!lastCapturedStones || lastCapturedStones.length !== 1) {
    return false;
  }
  const lastCapturedStone = lastCapturedStones[0];
  if (lastCapturedStone.x !== newStone.x || lastCapturedStone.y !== newStone.y) {
    return false;
  }
  if (!newCapturedStones || newCapturedStones.length !== 1) {
    return false;
  }
  const newCapturedStone = newCapturedStones[0];
  if (newCapturedStone.x !== lastStone.x || newCapturedStone.y !== lastStone.y) {
    return false;
  }
  return true;
}


function boardReducer(state = {defaultState}, action) {
  switch (action.type) {
    case ADD_LABEL:
      const { label } = action;
      if (!state.currentStone.labels) {
        state.currentStone.labels = {};
      }
      state.currentStone.labels[getLocHash(label)] = label.type;
      return Object.assign({}, state,
        {
          currentLabels: Object.assign({}, state.currentStone.labels)
        }
      );

    case ADD_STONE:
      let addedStone = addStone(state.board, state.currentStone, state.nextStoneId, action.stone, state.stones)
      if (!addedStone) {
        return state;
      }

      if (getGroupIfNoLiberties(state.board, addedStone, addedStone.color).length) {
        back(state.board, addedStone, true);
        return Object.assign({}, state, { error: "Move is suicidal" });
      }
      if (isKo(state.currentStone, addedStone)) {
        back(state.board, addedStone, true);
        return Object.assign({}, state, { error: "Ko" });
      }
      const nextInitialStones = _filter(addedStone.nextStones, (stone) => stone.isInitial);
      if (nextInitialStones.length > 0) {
        const randomNextStone = nextInitialStones[Math.floor(Math.random() * nextInitialStones.length)];
        addedStone = addStone(state.board, addedStone, state.nextStoneId, randomNextStone, state.stones)
      }
      return Object.assign({}, state,
        {
          currentStone: addedStone,
          currentLabels: addedStone.labels,
          nextStoneId: addedStone.id === state.nextStoneId ? state.nextStoneId+1 : state.nextStoneId,
          nextMoveColor: addedStone.color === BLACK ? WHITE : BLACK,
          error: '',
        }
      );

    case BACK:
      //const { board, currentStone } = state;
      const { shouldRemove } = action;
      back(state.board, state.currentStone, shouldRemove);
      if (!state.currentStone.previousStone) {
        return state;
      }
      return Object.assign({}, state,
        {
          currentStone: state.currentStone.previousStone,
          currentLabels: Object.assign({}, state.currentStone.previousStone.labels),
          nextMoveColor: state.currentStone.color,
        }
      );

    case FORWARD:
      if (!state.currentStone.nextStones || Object.keys(state.currentStone.nextStones).length === 0) {
        return state;
      }
      const nextStone = _values(state.currentStone.nextStones)
        .reduce((move1, move2) => (move1.lastSeen > move2.lastSeen) ? move1 : move2);
      _forEach(nextStone.capturedStones, (capturedStone) => {
        state.board[capturedStone.y][capturedStone.x] = undefined;
      });
      state.board[nextStone.y][nextStone.x] = nextStone.color;
      return Object.assign({}, state,
        {
          currentStone: nextStone,
          currentLabels: nextStone.labels,
          nextMoveColor: state.currentStone.color || (state.nextMoveColor === BLACK ? WHITE : BLACK)
        }
      );

    case INITIALIZE:
      const { gameTree } = action;
      const boardSize = gameTree.boardSize || 19;
      const board = new Array(boardSize);
      for (let i = 0; i < boardSize; i++) {
        board[i] = new Array(boardSize);
      }

      const rootStone = {
        addedStones: gameTree.addedStones,
        boardSize: boardSize,
        comment: gameTree.comment,
        firstMove: gameTree.firstMove,
        id: 0,
        labels: gameTree.labels,
      };
      const stones = { 0: rootStone }; // root of tree
      let nextStoneId = 1;
      _forEach(gameTree.addedStones, (stone) => {
        stone.id = nextStoneId++;
        stones[stone.id] = stone;
        const { x, y, color } = stone;
        board[y][x] = color;
      });

      _forEach(gameTree.children, (child) => {
        nextStoneId = addGameTree(board, rootStone, nextStoneId, child, stones);
      });

      return {
        board: board,
        boardSize: boardSize,
        currentStone: stones[0],
        currentLabels: stones[0].labels,
        nextStoneId: nextStoneId,
        nextMoveColor: gameTree.firstMove || BLACK,
        rootStone: rootStone,
        stones: stones,
      };

    case SET_INIT_BOARD:
      state.rootStone.firstMove = action.nextMoveColor;
      state.rootStone.addedStones = [];
      _forEach(state.board, (row, y) => {
        _forEach(row, (color, x) => {
          if (color) {
            state.rootStone.addedStones.push({ x, y, color });
          }
        });
      });
      return state;

    case UPDATE_COMMENT:
      state.currentStone.comment = action.comment;
      return state;

    default:
      return state;
  }
}

const boardReducers = combineReducers({
  boardReducer,
});

export default boardReducers;