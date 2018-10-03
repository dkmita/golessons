import React, { Component } from 'react';
import Board from './board/containers/Board';

import './App.css';


class App extends Component {
  render() {
    const initialStones = [
      { x: 0, y: 2, color: 1 },
      { x: 5, y: 1, color: 2 },
      { x: 4, y: 7, color: 2 },
    ];

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Go Lessons</h1>
        </header>
        <p className="App-intro">
          Welcome to Go Lessons
        </p>
        <Board initialStones={initialStones} boardSize={9} />
      </div>
    );
  }
}

export default App;
