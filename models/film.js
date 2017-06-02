module.exports = (sequelize, DataTypes) => {
  return sequelize.define('film', {
    title: DataTypes.STRING,
    releaseDate: {
      type: DataTypes.DATEONLY,
      field: 'release_date'
    },
    tagline: DataTypes.STRING,
    revenue: DataTypes.BIGINT,
    budget: DataTypes.BIGINT,
    runtime: DataTypes.INTEGER,
    originalLanguage: {
      type: DataTypes.STRING,
      field: 'original_language'
    },
    status: DataTypes.STRING
  }, {
    timestamps: false
  });
}
