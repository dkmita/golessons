import React, { Component } from 'react';
import Board from './board/containers/Board';

import './App.css';


const PROBLEM_COUNT = 85;

class App extends Component {
  state = {
    id: 0,
  };

  onChange = (ev) => {
    ;
  }

  render() {
    const options = [];
    for (let i = 0; i <= PROBLEM_COUNT; i++) {
        options.push(<option key={i} value={i}>{i}</option>);
    }

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Go Lessons</h1>
        </header>
        <br />
        <select name="cars"
            value={this.state.id}
            onChange={(ev) => this.setState({ id: Number(ev.target.value) })}>
          {options}
        </select>
        <span onClick={() => this.setState({ id: Math.max(this.state.id-1, 0) })}>Prev</span>
        <span onClick={() => this.setState({ id: Math.min(this.state.id+1, PROBLEM_COUNT) })}>Next</span>
        <Board id={this.state.id}/>
      </div>
    );
  }
}

export default App;
