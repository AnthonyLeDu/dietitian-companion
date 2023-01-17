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
    time_float: {
      type: DataTypes.VIRTUAL,
      get: function() {
        // Convert minutes and seconds into hours
        const timeArray = this.time.split(':').map((elem, idx) => Number(elem) / Math.pow(60, idx))
        // Add hours, minutes and seconds
        return timeArray.reduce((accumulator, curVal) => accumulator + curVal);
      }
    },
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
