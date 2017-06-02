const express = require('express');
const models = require('../models');
const router = express.Router();
const axios = require('axios');
const moment = require('moment');
const REVIEWS_API_URL = 'http://credentials-api.generalassemb.ly';
const REVIEWS_API_PATHNAME = '/4576f55f-c427-4cfc-a11c-5bfe914ca6c1';
const MIN_AVG_REVIEW_FOR_RECOMMENDATION = 4.0
const MIN_REVIEWS_FOR_RECOMMENDATION = 5
const YEARS_BEFORE_FOR_RECOMMENDATION = 15
const YEARS_AFTER_FOR_RECOMMENDATION = 15

const request = axios.create({
  baseURL: REVIEWS_API_URL
});

function getReviewsForFilms(filmIds) {
  if (typeof filmIds !== 'string' && typeof filmIds !== 'number' && !Array.isArray(filmIds)) {
    throw new Error('Expected filmIds to be either String, Number, or Array');
  }

  return request.get(REVIEWS_API_PATHNAME, {
    params: {
      films: Array.isArray(filmIds) ? filmIds.join(',') : filmIds
    }
  })
    .then(res => res.data);
}

/* example response:
{
  "recommendations" : [
    {
      "id": 109,
      "title": "Reservoir Dogs",
      "releaseDate": "09-02-1992",
      "genre": "Action",
      "averageRating": 4.2,
      "reviews": 202
    },
    {
      "id": 102,
      "title": "Jackie Brown",
      "releaseDate": "09-15-1997",
      "genre": "Action",
      "averageRating": 4.1,
      "reviews": 404
    },
    {
      "id": 85,
      "title": "True Romance",
      "releaseDate": "09-25-1993",
      "genre": "Action",
      "averageRating": 4.0,
      "reviews": 165098
    }
  ],
  "meta": {
    "limit": 10,
    "offset": 0
  }
}
*/

router.get('/:id/recommendations', getFilmRecommendations);

function getFilmRecommendations(req, res) {
  const filmId = req.params.id;
  const meta = Object.assign({
    offset: 0,
    limit: 10
  }, req.query);

  models.Film.findById(filmId)
    .then(film => {
      if (film) {
        // get films with same genre, without the requested film
        return models.Film.findAll({
          where: {
            id: {
              $ne: film.id
            },
            genre_id: film.genre_id,
          },
          order: [ 'id' ]
        })
          .then(candidates => candidates.filter(c => {
            // filter out release date -15 and +15 years
            const start = moment(film.releaseDate).subtract(YEARS_BEFORE_FOR_RECOMMENDATION, 'years');
            const end = moment(film.releaseDate).add(YEARS_AFTER_FOR_RECOMMENDATION, 'years');
            return moment(c.releaseDate).isBetween(start, end, 'year');
          }))
          .then(candidates => {
            // get list of reviews for all candidates
            const candidateIds = candidates.map(c => c.id);
            return getReviewsForFilms(candidateIds)
              .then(reviews => {
                return reviews
                  // remove less than 5 reviews
                  .filter(r => r.reviews.length >= MIN_REVIEWS_FOR_RECOMMENDATION )
                  // remove cumulative <= 4.0
                  .filter(r => {
                    const total = r.reviews.reduce((sum, cur) => sum + cur.rating, 0);
                    return (total / r.reviews.length) > MIN_AVG_REVIEW_FOR_RECOMMENDATION;
                  })
              })
          })
      } else {
        res.status(404).json({ message: `Film with id ${filmId} not found.` });
      }
    })
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

module.exports = router;
