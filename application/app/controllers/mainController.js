const { Food } = require('../models/ciqual/');

const mainController = {
  
  homePage: async (req, res) => {
    let foods = await Food.findAll({
      include: ['food_grp', 'food_ssgrp', 'food_ssssgrp'],
      // limit: 1000
    });
    foods = foods.map(food => {
      return {
        name: food.name_fr,
        group: food.food_grp.name_fr,
        sub_group: food.food_ssgrp.name_fr,
        sub_sub_group: food.food_ssssgrp.name_fr,
      };
    });
    res.render('index', {foods});
  }
  
}

module.exports = mainController;
