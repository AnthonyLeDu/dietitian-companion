const dayjs = require('dayjs');
const { Journal, Patient } = require('../models');

const journalController = {

  createJournalPage: (req, res) => {
    res.render('createJournal');
  },

  journalsPage: async (req, res, next) => {
    const findData = {
      order: [['updated_at', 'DESC']],
      // 'association' is important here because we may add 'where' below
      include: { association: 'patient' }
    }
    // Check if we want to filter by patient id
    const patient_id = req.query.patient;
    patient = undefined;
    if (patient_id !== undefined) {
      patient = await Patient.findByPk(patient_id);
      if (!patient) {
        return next(); // 404
      }
      findData.include.where = { id: patient_id };
    }
    const journals = await Journal.findAll(findData);
    res.render('journals', { journals, patient });
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
      return next(); // 404
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

}

module.exports = journalController;
