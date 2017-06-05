import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import FilmRecommendations from './FilmRecommendations';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filmId: 7264
    };

    this.handleChangeFilmId = this.handleChangeFilmId.bind(this);
  }

  handleChangeFilmId(event) {
    this.setState({
      filmId: event.target.value
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <FilmRecommendations filmId={this.state.filmId} onChange={this.handleChangeFilmId} />
      </div>
    );
  }
}

export default App;
