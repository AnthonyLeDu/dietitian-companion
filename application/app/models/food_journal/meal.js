/* global module */
const { DataTypes } = require('sequelize');
const JournalElement = require('./journalElement');
const getConnexion = require('./getConnexion');

class Meal extends JournalElement {
  nutrientsSources = this.dishes;

  getClassName() {
    return 'Meal';
  }
}

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
        if (this.time === null) return 0.0;
        // Convert minutes and seconds into hours
        const timeArray = this.time.split(':').map((elem, idx) => Number(elem) / Math.pow(60, idx));
        // Add all
        return timeArray.reduce((accumulator, curVal) => accumulator + curVal);
      }
    },
  },
  {
    sequelize: getConnexion(),
    modelName: 'Meal',
    tableName: 'meal'
  }
);

module.exports = Meal;
