import axios from 'axios';
import React, { Component } from 'react';
import FilmSelect from './FilmSelect';
import FilmList from './FilmList';

const API_URL = 'http://localhost:3000';

function getFilmRecommendations(options={}) {
  return axios.get('/films/7264/recommendations', {
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
      filmRecommendations: []
    };
  }

  componentDidMount() {
    if (this.props.filmId) {
      getFilmRecommendations()
        .then(filmRecommendations => {
          this.setState({ filmRecommendations });
        });
    }
  }

  render() {
    return (
      <div className="FilmRecommendations">
        <FilmSelect onChange={this.props.onChange} />
        <FilmList films={this.state.filmRecommendations} />
      </div>
    );
  }
};

export default FilmRecommendations
