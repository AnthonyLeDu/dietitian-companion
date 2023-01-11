const { Model, DataTypes } = require('sequelize');
const getConnexion = require('./getConnexion');

class FoodGroup extends Model {}

FoodGroup.init(
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
    modelName: 'FoodGroup',
    tableName: 'food_grp',
    timestamps: false
  }
)

module.exports = FoodGroup;
