const { Model, DataTypes } = require('sequelize');
const getConnexion = require('./getConnexion');

class FoodSubGroup extends Model {}

FoodSubGroup.init(
  {
    code: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    name_fr: DataTypes.STRING,
  },
  {
    sequelize: getConnexion(),
    modelName: 'FoodSubGroup',
    tableName: 'food_ssgrp',
    timestamps: false
  }
)

module.exports = FoodSubGroup;
