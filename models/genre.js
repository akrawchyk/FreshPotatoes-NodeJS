module.exports = (sequelize, DataTypes) => {
  return sequelize.define('genre', {
    name: DataTypes.STRING
  }, {
    timestamps: false
  });
};
