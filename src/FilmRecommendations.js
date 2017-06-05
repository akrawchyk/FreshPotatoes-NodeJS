import axios from 'axios';
import React, { Component } from 'react';
import FilmSelect from './FilmSelect';
import FilmList from './FilmList';

const API_URL = 'http://localhost:3000';

function getFilmRecommendations(options={}) {
  return axios.get(`/films/${options.filmId}/recommendations`, {
    baseURL: API_URL
  })
    .then(res => {
      const filmRecommendations = res.data.recommendations;
      return filmRecommendations;
    });
}

class FilmRecommendations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filmId: '',
      filmRecommendations: []
    };

    this.handleChangeFilmId = this.handleChangeFilmId.bind(this);
  }

  handleChangeFilmId(event) {
    this.setState({
      filmId: event.target.value
    });
  }

  componentDidMount() {
    if (this.state.filmId) {
      getFilmRecommendations({ filmId: this.state.filmId })
        .then(filmRecommendations => {
          this.setState({ filmRecommendations });
        });
    }
  }

  render() {
    return (
      <div className="FilmRecommendations">
        <FilmSelect filmId={this.state.filmId} onChange={this.handleChangeFilmId} />
        <FilmList films={this.state.filmRecommendations} />
      </div>
    );
  }
};

export default FilmRecommendations
