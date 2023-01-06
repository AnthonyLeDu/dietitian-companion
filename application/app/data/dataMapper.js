const database = require('./database');

dataMapper = {
  async getAllFood() {
    const query = "SELECT name_fr FROM food LIMIT 1000;";
    const result = await database.query(query);
    return result.rows;
  },
}

module.exports = dataMapper;