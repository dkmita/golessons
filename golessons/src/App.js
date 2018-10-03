import React, { Component } from 'react';
import Board from './board/containers/Board';

import './App.css';


class App extends Component {
  render() {


    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Go Lessons</h1>
        </header>
        <p className="App-intro">
          Welcome to Go Lessons
        </p>
        <Board />
      </div>
    );
  }
}

export default App;
