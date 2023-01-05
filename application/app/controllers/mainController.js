const dataMapper = require("../data/dataMapper");

const mainController = {
  
  homePage: async (req, res) => {
    const users = await dataMapper.getAllUsers();
    console.log(users);
    res.render('index', {users});
  }
  
}

module.exports = mainController;
