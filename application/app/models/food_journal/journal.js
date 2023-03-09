/* global module */
const { DataTypes } = require('sequelize');
const JournalElement = require('./journalElement');
const getConnexion = require('./getConnexion');

class Journal extends JournalElement {
  nutrientsSources = this.days;

  getClassName() {
    return 'Journal';
  }

  /**
   * Find a Journal based on given primaryKey. Fetch and sort all the info needed
   * for its display in the journal page foods (day names, foods nutrional calculations...).
   * @param {Number} primaryKey Journal id
   * @returns {Journal} Found journal or null
   */
  static async fetchByPkWithCalculations(primaryKey) {
    const journal = await Journal.findByPk(
      primaryKey, {
        include: [
          'patient',
          {
            association: 'days',
            include: [
              'journal',
              { association: 'meals', include: 'dishes' },
            ]
          }
        ]
      });

    if (!journal) return null; // Early return if no journal found

    // Sorting data (using 'for of' here is important to be synchronous !)
    journal.days.sort((a, b) => a.position - b.position); // Sorting days according to position
    for (const day of journal.days) {
      day.meals.sort((a, b) => a.time_float - b.time_float); // Sorting days according to time
      for (const meal of day.meals) {
        meal.dishes.sort((a, b) => a.position - b.position); // Sorting dishes according to position
        for (const dish of meal.dishes) {
          await dish.fetchFood(); // Getting the Food corresponding to the Dish.food_code
        }
      }
    }

    // Trigger the nutrients calculations recursively
    await journal.getNutrients();

    return journal;
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
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  },
  {
    sequelize: getConnexion(),
    modelName: 'Journal',
    tableName: 'journal'
  }
);


module.exports = Journal;
