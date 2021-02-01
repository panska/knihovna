'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookLoan extends Model {
    static associate(models) {
      BookLoan.belongsTo(models.Book, {
        foreignKey: {
          name: 'book',
        },
        targetKey: 'id',
      });
      BookLoan.belongsTo(models.User, {
        foreignKey: {
          name: 'borrower',
        },
        targetKey: 'id',
      });
    }
  }
  BookLoan.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      borrower: DataTypes.INTEGER,
      book: DataTypes.INTEGER,
      borrowDate: DataTypes.DATE,
      returnDate: DataTypes.DATE,
      returned: DataTypes.BOOLEAN,
      returnedDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'BookLoan',
    }
  );
  return BookLoan;
};
