const Sequelize = require('sequelize');

function getConnexion() {
  const sequelize = new Sequelize(process.env.CIQUAL_DB_URL);
  return sequelize;
}

module.exports = getConnexion;
