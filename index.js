const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
      app = express();

const { PORT=3000, NODE_ENV='development', DB_PATH='./db/database.db' } = process.env;

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PATH
});

const Genre = sequelize.define('genre', {
  name: Sequelize.STRING
}, {
  timestamps: false
});

const Artist = sequelize.define('artist', {
  name: Sequelize.STRING,
  birthday: Sequelize.DATEONLY,
  deathday: Sequelize.DATEONLY,
  gender: Sequelize.INTEGER,
  placeOfBirth: {
    type: Sequelize.STRING,
    field: 'place_of_birth'
  }
}, {
  timestamps: false
});

const Film = sequelize.define('film', {
  title: Sequelize.STRING,
  releaseDate: {
    type: Sequelize.DATEONLY,
    field: 'release_date'
  },
  tagline: Sequelize.STRING,
  revenue: Sequelize.BIGINT,
  budget: Sequelize.BIGINT,
  runtime: Sequelize.INTEGER,
  originalLanguage: {
    type: Sequelize.STRING,
    field: 'original_language'
  },
  status: Sequelize.STRING,
  genreId: {
    type: Sequelize.INTEGER,
    field: 'genre_id',
    references: {
      model: Genre,
      key: 'id'
    }
  }
}, {
  timestamps: false
});

// Film.belongsToMany(Artist, { through: 'artist_films', foreignKey: 'film_id' });
// Artist.belongsToMany(Film, { through: 'artist_films', foreignKey: 'artist_id' });

sequelize.sync().then(() => {
  console.log('hotdog')
}).catch(err => {
  console.log('not hotdog');
});

// START SERVER
Promise.resolve()
  .then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)))
  .catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); });

// ROUTES
app.get('/films/:id/recommendations', getFilmRecommendations);

// ROUTE HANDLER
function getFilmRecommendations(req, res) {
  const filmId = req.params.id;
  Film.findById(filmId)
    .then(film => res.json(film))
    .catch(err => { res.status(500).json({ message: err.message }) });
}

module.exports = app;
