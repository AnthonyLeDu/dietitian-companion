const Sequelize = require('sequelize');

function getConnexion() {
  const sequelize = new Sequelize(
    process.env.FOOD_JOURNAL_NAME,
    process.env.FOOD_JOURNAL_USER,
    process.env.FOOD_JOURNAL_PASSWORD,
    {
      define: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      host: process.env.FOOD_JOURNAL_DB_HOST,
      dialect: process.env.DB_ENV
    }
  );
  return sequelize;
}

module.exports = getConnexion;
