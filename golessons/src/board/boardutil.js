import _forEach from 'lodash/forEach';
import _pick from 'lodash/pick';

export const getLocHash = (stone) => {
  const { x, y } = stone;
  return x * 100 + y;
};

const SIMPLIFIED_DATA_FIELDS = ['addedStones', 'boardSize', 'color', 'comment', 'firstMove', 'labels', 'x', 'y'];

export const simplifyGameTree = (stone) => {
  const simplifiedStone = _pick(stone, SIMPLIFIED_DATA_FIELDS);
  _forEach(stone.nextStones, (child) => {
    if (!simplifiedStone.children) {
      simplifiedStone.children = [];
    }
    simplifiedStone.children.push(simplifyGameTree(child));
  });
  return simplifiedStone;
};
