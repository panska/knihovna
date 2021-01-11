'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      Book.hasMany(models.BookLoan, {
        foreignKey: {
          name: 'book',
        },
        as: 'loans',
      });
    }
  }
  Book.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      cover: DataTypes.STRING,
      name: DataTypes.STRING,
      author: DataTypes.STRING,
      genre: DataTypes.STRING,
      isbn: DataTypes.STRING,
      total: DataTypes.INTEGER,
      available: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Book',
    }
  );
  return Book;
};
