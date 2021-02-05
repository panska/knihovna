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
      isbn: DataTypes.STRING,
      name: DataTypes.STRING,
      authorGivenName: DataTypes.STRING,
      authorFamilyName: DataTypes.STRING,
      coverUrl: DataTypes.STRING,
      genre: DataTypes.STRING,
      annotation: DataTypes.TEXT,
      publicationYear: DataTypes.INTEGER,
      publisher: DataTypes.STRING,
      registrationYear: DataTypes.INTEGER,
      origin: DataTypes.STRING,
      purchasePrice: DataTypes.FLOAT,
      deaccessYear: DataTypes.INTEGER,
      graduationReading: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Book',
    }
  );
  return Book;
};
