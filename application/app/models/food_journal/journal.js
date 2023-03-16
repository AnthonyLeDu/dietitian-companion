/* global module */
const { DataTypes } = require('sequelize');
const JournalElement = require('./journalElement');
const getConnexion = require('./getConnexion');

class Journal extends JournalElement {
  nutrientsSources = this.days;

  getClassName() {
    return 'Journal';
  }

}

Journal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    patient_age: {
      type: DataTypes.INTEGER, // years
    },
    patient_weight: {
      type: DataTypes.INTEGER, // kg
    },
    start_day: {
      type: DataTypes.DATEONLY,
    },
  },
  {
    sequelize: getConnexion(),
    modelName: 'Journal',
    tableName: 'journal'
  }
);


module.exports = Journal;
