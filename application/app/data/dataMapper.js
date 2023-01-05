const database = require('./database');

dataMapper = {
  async getAllUsers() {
    const query = "SELECT * FROM users";
    const result = await database.query(query);
    return result.rows;
  },
}

module.exports = dataMapper;