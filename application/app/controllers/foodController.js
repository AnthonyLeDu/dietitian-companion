const { Food } = require('../models');

const foodController = {

  getFoods: async () => {
    const foods = await Food.findAll({
      include: ['food_grp', 'food_ssgrp', 'food_ssssgrp'],
      order: [['food_grp', 'name_fr'], ['food_ssgrp', 'name_fr'], ['food_ssssgrp', 'name_fr'], ['name_fr']]
    });
    return foods;
  },

  apiGetFoods: async (req, res) => {
    const foods = await foodController.getFoods();
    return res.json(foods);
  },

  foodsPage: async (req, res) => {
    const foods = await foodController.getFoods();
    res.render('foods', { foods });
  }

}

module.exports = foodController;
