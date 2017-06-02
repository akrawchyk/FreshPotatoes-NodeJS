const path = require('path');
const sqlite = require('sqlite');
const Sequelize = require('sequelize');

const { DB_PATH=path.join(__dirname, '../db/database.db') } = process.env;

const models = {};

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PATH
});

// see http://docs.sequelizejs.com/manual/tutorial/models-definition.html#import
models.Artist = sequelize.import(path.join(__dirname, 'artist'));
models.Genre = sequelize.import(path.join(__dirname, 'genre'));
models.Film = sequelize.import(path.join(__dirname, 'film'));

// associations
models.Film.belongsTo(models.Genre, { foreignKey: 'genre_id' });

models.sequelize = sequelize;

module.exports = models;
