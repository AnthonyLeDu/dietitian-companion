const { Food } = require('../models');

const mainController = {

  homePage: async (req, res) => {
    res.render('index');
  },

  ciqualTablePage: async (req, res) => {
    const foods = await Food.findAll({
      include: ['food_grp', 'food_ssgrp', 'food_ssssgrp'],
    });
    res.render('ciqualTable', { foods });
  }

}

module.exports = mainController;
