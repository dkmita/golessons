import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import boardReducers from './board/reducers';

const store = createStore(boardReducers);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();


/*
const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id))
    }
  }
}

// Log the initial state
console.log(store.getState());

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
const unsubscribe = store.subscribe(() => console.log(store.getState()));

// Dispatch some actions
store.dispatch(initialize([{x:1, y:2, color:1}, {x:2, y:4, color: 2}], 9));
store.dispatch(addStone({x:1, y:4, color: 1}));
store.dispatch(addStone({x:4, y:3, color: 2}));
store.dispatch(back());
store.dispatch(forward());


// Stop listening to state updates
unsubscribe();
*/
