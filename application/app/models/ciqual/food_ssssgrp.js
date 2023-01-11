const { Model, DataTypes } = require('sequelize');
const getConnexion = require('./getConnexion');

class FoodSubSubGroup extends Model {}

FoodSubSubGroup.init(
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
    modelName: 'FoodSubSubGroup',
    tableName: 'food_ssssgrp',
    timestamps: false
  }
)

module.exports = FoodSubSubGroup;
