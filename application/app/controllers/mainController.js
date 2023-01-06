const dataMapper = require("../data/dataMapper");

const mainController = {
  
  homePage: async (req, res) => {
    const foods = await dataMapper.getAllFood();
    res.render('index', {foods});
  }
  
}

module.exports = mainController;
