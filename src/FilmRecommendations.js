import axios from 'axios';
import React, { Component } from 'react';
import FilmList from './FilmList';

const API_URL = 'http://localhost:3000';

class FilmRecommendations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filmId: props.filmId,
      filmRecommendations: []
    };
  }

  componentDidMount() {
    if (this.state.filmId) {
      axios.get('/films/7264/recommendations', {
        baseURL: API_URL
      })
        .then(res => {
          const filmRecommendations = res.data.recommendations;
          this.setState({ filmRecommendations });
        });
    }
  }

  render() {
    return (
      <div className="FilmRecommendations">
        <FilmList films={this.state.filmRecommendations} />
      </div>
    );
  }
};

export default FilmRecommendations
