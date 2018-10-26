export const ADD_STONE = 'PLAY_STONE';
export const BACK = 'BACK';
export const FORWARD = 'FORWARD';
export const INITIALIZE = 'INITIALIZE';

export function addStone(stone) {
  return { type: ADD_STONE, stone }
}

export function back() {
  return { type: BACK }
}

export function forward() {
  return { type: FORWARD }
}

export function initialize(gameTree) {
  return { type: INITIALIZE, gameTree }
}