/* global module */
const { DataTypes } = require('sequelize');
const JournalElement = require('./journalElement');
const { Food } = require('../ciqual');
const getConnexion = require('./getConnexion');
const nutrientsData = require('../../data/nutrientsData.json');

class Dish extends JournalElement {
  food;
  nutrients;

  getClassName() {
    return 'Dish';
  }

  async fetchFood(force = false) {
    if (!this.food || force) {
      this.food = await Food.findByPk(this.food_code);
    }
  }

  /**
   * Fetch associated food nutrients
   */
  async calculateNutrients() {
    const shareOfRefAmount = this.amount / 100.0; // All nutrients are per 100g.

    await this.fetchFood(); // Making sure this.food is accessible
    this.nutrients = [];
    for (const nutrientData of nutrientsData) {
      const ownNutrient = {
        dbName: nutrientData.dbName,
        shortName: nutrientData.shortName,
        unit: nutrientData.unit,
        minAmount: 0,
        maxAmount: 0,
        traces: false
      };
      if (!this.amount) continue;
      const sourceNutrientValue = this.food[nutrientData.dbName];
      // If traces
      if (sourceNutrientValue.includes('traces')) {
        ownNutrient.traces = true;
      }
      // If below X (add to maxAmount)
      else if (sourceNutrientValue.startsWith('<')) {
        ownNutrient.maxAmount = shareOfRefAmount * parseFloat(sourceNutrientValue.replace('<', ''));
      }
      // If a number (add to minAmount)
      else if (!isNaN(Number(sourceNutrientValue))) {
        ownNutrient.minAmount = ownNutrient.maxAmount = shareOfRefAmount * Number(sourceNutrientValue);
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
    amount: DataTypes.FLOAT, // g
    food_code: DataTypes.INTEGER, // Ciqual DB food code
  },
  {
    sequelize: getConnexion(),
    modelName: 'Dish',
    tableName: 'dish'
  }
);

module.exports = Dish;
