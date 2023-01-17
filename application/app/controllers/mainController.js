const dayjs = require('dayjs');
const { Food, Journal, Patient } = require('../models');

const mainController = {

  homePage: async (req, res) => {
    res.render('index');
  },

  patientsPage: async (req, res) => {
    const patients = await Patient.findAll({
      order: [['last_name', 'DESC'], ['first_name', 'DESC']],
      include: 'journals'
    });
    res.render('patients', { patients });
  },

  patientPage: async (req, res, next) => {
    const patient = await Patient.findByPk(
      req.params.id,
      { include: 'journals' }
    );
    if (!patient) {
      next(); // 404
      return;
    }
    res.render('patient', { patient });
  },

  journalsPage: async (req, res) => {
    const findData = {
      order: [['updated_at', 'DESC']],
      include: 'patient'
    }
    // Check if we want to filter by patient id
    const patient_id = req.query.patient;
    filtered = false;
    if (patient_id) {
      filtered = true;
      findData.include.where = { id: patient_id };
    }
    const journals = await Journal.findAll(findData);
    res.render('journals', { journals, filtered });
  },

  journalPage: async (req, res, next) => {
    const journal = await Journal.findByPk(
      req.params.id, {
      include: [
        'patient',
        {
          association: 'days', include:
            { association: 'meals', include: 'dishes' },
        }
      ]
    });

    if (!journal) {
      next(); // 404
      return;
    }

    // Using 'for of' here is important to be synchronous !
    journal.days.sort((a, b) => a.position - b.position); // Sorting days according to position
    for (const day of journal.days) {
      // Getting the days name
      day.name = dayjs(journal.start_day)
        // Adding the day position to the journal's start_day  
        .add(day.position, 'day')
        .toDate().toLocaleString('fr-FR', { weekday: 'long' });

      // Getting the Food corresponding to the dish food_code
      day.meals.sort((a, b) => a.time_float - b.time_float); // Sorting days according to time
      // console.table(day.meals[0].toJSON());
      for (const meal of day.meals) {
        meal.dishes.sort((a, b) => a.position - b.position); // Sorting dishes according to position
        for (const dish of meal.dishes) {
          await dish.fetchFood();
        }
      }
    }

    res.render('journal', { journal });
  },

  ciqualTablePage: async (req, res) => {
    const foods = await Food.findAll({
      include: ['food_grp', 'food_ssgrp', 'food_ssssgrp'],
    });
    res.render('ciqualTable', { foods });
  }

}

module.exports = mainController;
