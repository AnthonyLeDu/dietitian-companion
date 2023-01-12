const { Model, DataTypes } = require('sequelize');
const getConnexion = require('./getConnexion');

class Patient extends Model {}

Patient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    last_name: DataTypes.STRING,
    first_name: DataTypes.STRING,
    gender: {
      type: DataTypes.STRING,  // 'Male' or 'Female'
      allowNull: false
    },
    birth_date: DataTypes.DATE,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  },
  {
    sequelize: getConnexion(),
    modelName: 'Patient',
    tableName: 'patient'
  }
)

module.exports = Patient;
