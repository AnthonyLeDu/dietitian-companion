const { Model, DataTypes } = require('sequelize');
const { Food } = require('../ciqual');
const getConnexion = require('./getConnexion');

class Dish extends Model {
  food;

  async fetchFood(force=false) {
    if (this.food === undefined || force) {
      this.food = await Food.findByPk(this.food_code);
    }
  }
}

Dish.init(
  {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    position: DataTypes.INTEGER, // Just for ordering the Meal dishes
    amount: {
      type: DataTypes.FLOAT, // g
      allowNull: false
    },
    food_code: {
      type: DataTypes.INTEGER, // Ciqual DB food code
      allowNull: false
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  },
  {
    sequelize: getConnexion(),
    modelName: 'Dish',
    tableName: 'dish'
  }
)

module.exports = Dish;
