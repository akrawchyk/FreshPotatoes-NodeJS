const express = require('express');
const models = require('../models');
const axios = require('axios');
const moment = require('moment'); const REVIEWS_API_URL = 'http://credentials-api.generalassemb.ly';
const REVIEWS_API_PATHNAME = '/4576f55f-c427-4cfc-a11c-5bfe914ca6c1';
const RECOMMENDATION_MIN_AVG_RATING = 4.0;
const RECOMMENDATION_MIN_REVIEWS = 5;
const RECOMMENDATION_YEARS_BEFORE = 15;
const RECOMMENDATION_YEARS_AFTER = 15;

const router = express.Router();
const request = axios.create({
  baseURL: REVIEWS_API_URL
});

/**
 * Coerces query params we care about to numbers
 * @param {Object} query - express query params
 */
function parseQuery(query) {
  const ret = Object.assign({}, query);  // clone

  if (ret.offset) {
    ret.offset = parseInt(ret.offset, 10);
  }

  if (ret.limit) {
    ret.limit = parseInt(ret.limit, 10);
  }

  return ret;
}

/**
 * Takes a film review and outputs the average rating of all of its reviews
 * @param {Object} filmReview - film review object from 3rd party API
 */
function computeAverageRating(filmReview) {
  const total = filmReview.reviews.reduce((sum, cur) => sum + cur.rating, 0);
  const average = parseFloat(total / filmReview.reviews.length);
  return parseFloat(average.toPrecision(3), 10);
}

/**
 * @param {Film}
 */
function getRecommendableFilmReviews(film, limit, offset) {
  // get films with same genre, without the requested film
  return models.Film.findAll({
    where: {
      id: {
        $ne: film.id
      },
      genre_id: film.genre_id
    }
  })
    .then(genreFilms => {
      const candidateRecommendations = genreFilms.filter(gf => {
        // filter out release date -15 and +15 years
        const start = moment(film.releaseDate).subtract(RECOMMENDATION_YEARS_BEFORE, 'years');
        const end = moment(film.releaseDate).add(RECOMMENDATION_YEARS_AFTER, 'years');
        return moment(gf.releaseDate).isBetween(start, end, 'year');
      });

      // get list of reviews for all candidateRecommendations
      const candidateIds = candidateRecommendations.map(c => c.id);
      return getReviewsForFilms(candidateIds)
        .then(filmReviews => filmReviews
          // remove films with < 5 reviews
          .filter(fr => fr.reviews.length >= RECOMMENDATION_MIN_REVIEWS)
          // remove films with cumulative rating <= 4.0
          .filter(fr => computeAverageRating(fr) > RECOMMENDATION_MIN_AVG_RATING ));
    });
}

/**
 * @param {Array[Object]} filmReviews - array of film review objects from 3rd party API
 */
function makeFilmRecommendations(filmReviews, limit, offset) {
  // match films with reviews
  const filmIds = filmReviews.map(fr => fr.film_id);
  return models.Film.findAll({
    where: {
      id: {
        in: filmIds
      }
    },
    include: [models.Genre],
    limit, offset
  })
    .then(films => films.map(f => {
      const filmReview = filmReviews.filter(fr => fr.film_id === f.id)[0];

      return {
        // film properties
        id: f.id,
        title: f.title,
        releaseDate: f.releaseDate,
        genre: f.genre.name,
        // review properties
        averageRating: computeAverageRating(filmReview),
        reviews: filmReview.reviews.length
      };
    }));
}

/**
 * Queries 3rd party API for film review data
 * @param {string|number|array} filmIds - a single film id, an array of film ids, or a csv string of film ids.
 */
function getReviewsForFilms(filmIds) {
  if (typeof filmIds !== 'string' && typeof filmIds !== 'number' && !Array.isArray(filmIds)) {
    throw new TypeError('Expected filmIds to be either string, number, or Array');
  }

  return request.get(REVIEWS_API_PATHNAME, {
    params: {
      films: Array.isArray(filmIds) ? filmIds.join(',') : filmIds
    }
  })
    .then(res => res.data);
}

/**
 * @param {number|string} filmId
 */
function getRecommendableFilms(filmId, options) {
  return models.Film.findById(filmId)
    .then(film => {
      if (film) {
        return getRecommendableFilmReviews(film)
          .then(filmReviews => makeFilmRecommendations(filmReviews, options.limit, options.offset));
      } else {
        res.status(422).json({ message: `Film with id ${filmId} not found.` });
        return next();
      }
    });
}

function getFilmRecommendations(req, res, next) {
  const filmId = parseInt(req.params.id, 10);
  const meta = Object.assign({
    offset: 0,
    limit: 10
  }, parseQuery(req.query));

  // check the request input
  if (isNaN(filmId)) {
    res.status(422).json({ message: `Unexpected id ${req.params.id}, is not a number.` });
    return next();
  }

  if (isNaN(meta.offset)) {
    res.status(422).json({ message: `Unexpected offset ${req.query.offset}, is not a number.` });
    return next();
  }

  if (isNaN(meta.limit)) {
    res.status(422).json({ message: `Unexpected limit ${req.query.limit}, is not a number.` });
    return next();
  }

  return getRecommendableFilms(filmId, meta)
    .then(recommendations => res.json({
      recommendations,
      meta
    }))
    .catch(err => {
      if (err.response) {
        // error is from 3rd party API call
        res.status(err.response.status).json({ message: err.message });
      } else {
        // something else went wrong
        res.status(500).json({ message: err.message });
      }
    });
}

router.get('/:id/recommendations', getFilmRecommendations);

module.exports = router;
