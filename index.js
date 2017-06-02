const express = require('express');
const app = express();
const films = require('./routes/films');
const models = require('./models');

const { PORT=3000, NODE_ENV='development' } = process.env;

app.use('/films', films);

models.sequelize.sync()
  .then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)))
  .catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); });

module.exports = app;
