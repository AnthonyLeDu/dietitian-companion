const { Food } = require('../models/ciqual/');
const { Patient } = require('../models/food_journal/');

const mainController = {
  
  homePage: async (req, res) => {
    res.render('index');
  },

  journalsPage: async (req, res) => {
    const patients = await Patient.findAll({
      include: {
        association: 'journals',
      }
    })
    res.render('journals', {patients});
  },
  
  ciqualTablePage: async (req, res) => {
    const foods = await Food.findAll({
      include: ['food_grp', 'food_ssgrp', 'food_ssssgrp'],
    });
    res.render('ciqualTable', {foods});
  }
  
}

module.exports = mainController;
