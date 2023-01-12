const { Model, DataTypes } = require('sequelize');
const getConnexion = require('./getConnexion');

class Meal extends Model {}

Meal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    time: DataTypes.TIME,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  },
  {
    sequelize: getConnexion(),
    modelName: 'Meal',
    tableName: 'meal'
  }
)

module.exports = Meal;
