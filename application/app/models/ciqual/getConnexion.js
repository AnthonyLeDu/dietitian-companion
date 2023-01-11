const Sequelize = require('sequelize');

function getConnexion() {
  const sequelize = new Sequelize(
    process.env.CIQUAL_DB_NAME,
    process.env.CIQUAL_DB_USER,
    process.env.CIQUAL_DB_PASSWORD,
    {
      define: {
        // createdAt: created_at,
        // updatedAt: updated_at
      },
      host: process.env.CIQUAL_DB_HOST,
      dialect: process.env.DB_ENV
    }
  );
  return sequelize;
}

module.exports = getConnexion;
