const { Model, DataTypes } = require('sequelize');
const getConnexion = require('./getConnexion');

class Day extends Model {}

Day.init(
  {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    position: DataTypes.INTEGER, // Just for ordering the days
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  },
  {
    sequelize: getConnexion(),
    modelName: 'Day',
    tableName: 'day'
  }
)

module.exports = Day;
