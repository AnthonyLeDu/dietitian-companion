const { Food } = require('../models');

const mainController = {

  homePage: async (req, res) => {
    res.render('index');
  },

}

module.exports = mainController;
