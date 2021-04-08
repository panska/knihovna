'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Projection extends Model {
    static associate(models) {}
  }
  Projection.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: DataTypes.STRING,
      movieName: DataTypes.STRING,
      movieData: DataTypes.STRING,
      moviePoster: DataTypes.STRING,
      start: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Projection',
    }
  );
  return Projection;
};
