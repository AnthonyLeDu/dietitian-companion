/* global module */
const { Dish, Meal } = require('../../models');

const dishController = {

  // -----------------
  // GENERIC FUNCTIONS
  // -----------------
  getDishes: async () => {
    return await Dish.findAll({
      include: 'meal'
    });
  },

  getDish: async (dishID) => {
    const dish = await Dish.findByPk(
      dishID, {
        include: 'meal'
      }
    );
    return dish;
  },

  /**
   * Find dishes associated to a meal's id.
   * @param {Integer} mealID Meal's id
   * @returns {Array<Dish>} Matching Dishes array.
   */
  getMealDishes: async (mealID) => {
    const meal = await Meal.findByPk(mealID);
    if (!meal) return [];
    const findData = {
      order: ['position'],
      where: { meal_id: mealID },
    };
    return await Dish.findAll(findData);
  },

  // -------------
  // API FUNCTIONS
  // -------------

  apiCreateDish: async (req, res) => {
    const dishData = req.body;
    const dish = await Dish.create(dishData);
    return res.json(dish);
  },

  apiUpdateDish: async (req, res, next) => {
    const { id } = req.params;
    let dish = await dishController.getDish(id);
    if (!dish) return next(); // 404
    // Converting empy values to null
    for (const prop in req.body) {
      req.body[prop] = req.body[prop] || null;
    }
    console.log(req.body);
    await dish.update(req.body);
    // Re-get meal in case day_id has been changed.
    dish = await dishController.getDish(req.params.id);
    res.json(dish);
  },

  apiGetDishes: async (req, res, next) => {
    let dishes;
    if (req.query.journal !== undefined) {
      dishes = await dishController.getMealDishes(req.query.journal);
    } else {
      dishes = await dishController.getDishes();
    }
    if (!dishes) return next(); // meal id was provided but meal not found
    res.json(dishes);
  },

  apiGetDish: async (req, res, next) => {
    const dish = await dishController.getDish(req.params.id);
    if (!dish) return next(); // 404
    res.json(dish);
  },
};

module.exports = dishController;
