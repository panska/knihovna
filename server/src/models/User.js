'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.BookLoan, {
        foreignKey: {
          name: 'borrower',
        },
        as: 'loans',
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      oid: {
        type: DataTypes.STRING,
        unique: true,
      },
      displayName: DataTypes.STRING,
      givenName: DataTypes.STRING,
      familyName: DataTypes.STRING,
      email: DataTypes.STRING,
      permissions: DataTypes.ARRAY(DataTypes.STRING),
    },
    {
      sequelize,
      modelName: 'User',
      paranoid: true,
    }
  );
  return User;
};
