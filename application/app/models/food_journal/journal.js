const { Model, DataTypes } = require('sequelize');
const getConnexion = require('./getConnexion');

class Journal extends Model {}

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
      allowNull: false
    },
    patient_weight: {
      type: DataTypes.INTEGER, // kg
      allowNull: false
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  },
  {
    sequelize: getConnexion(),
    modelName: 'Journal',
    tableName: 'journal'
  }
)

module.exports = Journal;
