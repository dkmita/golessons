export const ADD_STONE = 'PLAY_STONE';
export const BACK = 'BACK';
export const FORWARD = 'FORWARD';
export const INITIALIZE = 'INITIALIZE';
export const UPDATE_COMMENT = 'UPDATE_COMMENT';


export function addStone(stone) {
  return { type: ADD_STONE, stone }
}

export function back(shouldRemove) {
  return { type: BACK, shouldRemove }
}

export function forward() {
  return { type: FORWARD }
}

export function initialize(gameTree) {
  return { type: INITIALIZE, gameTree }
}

export function updateComment(comment) {
  return { type: UPDATE_COMMENT, comment }
}
