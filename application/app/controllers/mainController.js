const { Food } = require('../models/ciqual/');
const { Journal } = require('../models/food_journal/');

const mainController = {
  
  homePage: async (req, res) => {
    res.render('index');
  },

  journalsPage: async (req, res) => {
    const journals = await Journal.findAll({
      order: [['updated_at', 'DESC']],
      include: {
        association: 'patient',
      }
    })
    res.render('journals', {journals});
  },
  
  ciqualTablePage: async (req, res) => {
    const foods = await Food.findAll({
      include: ['food_grp', 'food_ssgrp', 'food_ssssgrp'],
    });
    res.render('ciqualTable', {foods});
  }
  
}

module.exports = mainController;
