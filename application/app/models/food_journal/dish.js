const { DataTypes } = require('sequelize');
const JournalElement = require('./journalElement');
const { Food } = require('../ciqual');
const getConnexion = require('./getConnexion');
const nutrientsData = require('../../data/nutrientsData.json');

class Dish extends JournalElement {
  food;
  nutrients;

  getClassName() {
    return "Dish";
  }

  async fetchFood(force = false) {
    if (this.food === undefined || force) {
      this.food = await Food.findByPk(this.food_code);
    }
  }

  /**
   * Fetch associated food
   */
  async calculateNutrients() {

    await this.fetchFood(); // Making sure this.food is accessible
    this.nutrients = [];
    for (const nutrientData of nutrientsData) {
      const ownNutrient = {...nutrientData, minAmount: 0, maxAmount: 0, traces: false };
      const sourceNutrientValue = this.food[nutrientData.dbName];
      // If traces
      if (sourceNutrientValue.includes('traces')) {
        ownNutrient.traces = true;
      }
      // If below X (add to maxAmount)
      else if (sourceNutrientValue.startsWith('<')) {
        ownNutrient.maxAmount = parseFloat(sourceNutrientValue.replace('<', ''));
      }
      // If a number (add to minAmount)
      else if (!isNaN(Number(sourceNutrientValue))) {
        ownNutrient.minAmount = ownNutrient.maxAmount = Number(sourceNutrientValue);
      }
      // Unhandled (throw error)
      else {
        throw new Error(`Nutrient '${nutrientData.dbName}' coming from Food code '${this.food.code}' cannot be handled.`);
      }

      ownNutrient.avgAmount = ((ownNutrient.minAmount + ownNutrient.maxAmount) / 2.0).toFixed(2);
      ownNutrient.amountMargin = ((ownNutrient.maxAmount - ownNutrient.minAmount) / 2.0).toFixed(2);

      this.nutrients.push(ownNutrient);
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
