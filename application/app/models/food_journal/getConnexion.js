const Sequelize = require('sequelize');

function getConnexion() {
  const sequelize = new Sequelize(
    process.env.FOOD_JOURNAL_DB_URL,
    {
      define: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
    }
  );
  return sequelize;
}

module.exports = getConnexion;
