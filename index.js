const express = require('express');
const app = express();
const films = require('./routes/films');
const models = require('./models');

const { PORT=3000, NODE_ENV='development' } = process.env;

app.use('/films', films);
app.get('*', missingRouteHandler);

models.sequelize.sync()
  .then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)))
  .catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); });

function missingRouteHandler(req, res) {
  res.status(404).json({ message: 'Not found' });
}

module.exports = app;
