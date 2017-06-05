import axios from 'axios';
import React, { Component } from 'react';

const API_URL = 'http://localhost:3000';

function getFilms(options={}) {
  return axios.get('/films/', {
    baseURL: API_URL
  })
    .then(res => {
      const films = res.data.films;
      return films;
    });
}

class FilmSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      films: [],
    };
  }

  componentDidMount() {
    getFilms()
      .then(films => {
        this.setState({ films });
      });
  }

  render() {
    let options = <option>Loading...</option>;

    if (this.state.films.length) {
      options = this.state.films.map(film => {
        return (
          <option key={film.id} value={film.id}>{film.title}</option>
        );
      });
    }

    return (
      <div className="FilmSelect">
        <select onChange={this.props.onChange} value={this.props.filmId}>
          {options}
        </select>
      </div>
    );
  }
};

export default FilmSelect;
