const dayjs = require('dayjs');
const Day = require('./day');
const Dish = require('./dish');
const Journal = require('./journal');
const Meal = require('./meal');
const Patient = require('./patient');

// Journal-Patient association

Patient.hasMany(Journal, {
  as: 'journals',
  foreignKey: 'patient_id'
});

Journal.belongsTo(Patient, {
  as: 'patient',
  foreignKey: 'patient_id'
});

// Day-Journal association

Journal.hasMany(Day, {
  as: 'days',
  foreignKey: 'journal_id'
});

Day.belongsTo(Journal, {
  as: 'journal',
  foreignKey: 'journal_id'
});

Object.defineProperty(Day.prototype, 'name', {
  get: function() {
    if (!this.journal.start_day) return '';
    return dayjs(this.journal.start_day)
      // Adding the day position to the journal's start_day  
      // eslint-disable-next-line no-undef
      .add(day.position, 'day')
      .toDate().toLocaleString('fr-FR', { weekday: 'long' });
  }
});

// Meal-Day association

Day.hasMany(Meal, {
  as: 'meals',
  foreignKey: 'day_id'
});

Meal.belongsTo(Day, {
  as: 'day',
  foreignKey: 'day_id'
});

// Dish-Meal association

Meal.hasMany(Dish, {
  as: 'dishes',
  foreignKey: 'meal_id'
});

Dish.belongsTo(Meal, {
  as: 'meal',
  foreignKey: 'meal_id'
});


module.exports = { Day, Dish, Journal, Meal, Patient };
