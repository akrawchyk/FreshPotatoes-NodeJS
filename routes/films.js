const express = require('express');
const models = require('../models');
const router = express.Router();

router.get('/:id/recommendations', getFilmRecommendations);

function getFilmRecommendations(req, res) {
  const filmId = req.params.id;

  models.Film.findById(filmId)
    .then(film => {
      if (film) {
        res.json(film)
      } else {
        res.status(404).json({ message: `Film with id ${filmId} not found.` });
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
}

module.exports = router;
