/* global process, module */
const dayjs = require('dayjs');
dayjs.locale(require('dayjs/locale/fr'));
const { Sequelize, DataTypes } = require('sequelize');

const DATES_FORMAT = 'ddd D MMMM YYYY (HH[h]mm)';

function getConnexion() {
  const sequelize = new Sequelize(
    process.env.FOOD_JOURNAL_DB_URL,
    {
      define: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      logging: false
    }
  );

  sequelize.addHook('beforeDefine', (attributes) => {
    Object.assign(attributes, {
      created_at: {
        type: DataTypes.DATE,
        get() {
          return dayjs(this.getDataValue('created_at')).format(DATES_FORMAT);
        }
      },
      updated_at: {
        type: DataTypes.DATE,
        get() {
          return dayjs(this.getDataValue('updated_at')).format(DATES_FORMAT);
        }
      }
    });
  });

  return sequelize;
}

module.exports = getConnexion;
