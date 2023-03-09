/* global module */
const { Meal, Day } = require('../../models');

const mealController = {

  // -----------------
  // GENERIC FUNCTIONS
  // -----------------
  getMeals: async () => {
    return await Meal.findAll({
      include: 'day'
    });
  },

  getMeal: async (mealID) => {
    const meal = await Meal.findByPk(
      mealID, {
        include: 'day'
      }
    );
    return meal;
  },

  /**
   * Find meals associated to a day's id.
   * @param {Integer} dayID Day's id
   * @returns {Array<Meal>} Matching Meals array.
   */
  getDayMeals: async (dayID) => {
    const day = await Day.findByPk(dayID);
    if (!day) return [];
    const findData = {
      order: ['time_float'],
      where: { day_id: dayID },
    };
    return await Meal.findAll(findData);
  },

  // -------------
  // API FUNCTIONS
  // -------------

  apiCreateMeal: async (req, res) => {
    const mealData = req.body;
    const meal = await Meal.create(mealData);
    return res.json(meal);
  },

  apiUpdateMeal: async (req, res, next) => {
    const { id } = req.params;
    let meal = await mealController.getMeal(id);
    if (!meal) return next(); // 404
    // Converting empy values to null
    for (const prop in req.body) {
      req.body[prop] = req.body[prop] || null;
    }
    await meal.update(req.body);
    // Re-get meal in case day_id has been changed.
    meal = await mealController.getMeal(req.params.id);
    res.json(meal);
  },

  apiGetMeals: async (req, res, next) => {
    let meals;
    if (req.query.journal !== undefined) {
      meals = await mealController.getDayMeals(req.query.journal);
    } else {
      meals = await mealController.getMeals();
    }
    if (!meals) return next(); // day id was provided but day not found
    res.json(meals);
  },

  apiGetMeal: async (req, res, next) => {
    const meal = await mealController.getMeal(req.params.id);
    if (!meal) return next(); // 404
    res.json(meal);
  },
};

module.exports = mealController;
