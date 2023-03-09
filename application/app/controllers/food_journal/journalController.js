/* global module */
// eslint-disable-next-line no-unused-vars
const dayjs = require('dayjs');
const { Journal, Patient } = require('../../models');
const patientController = require('../patientController');

const journalController = {

  // -----------------
  // GENERIC FUNCTIONS
  // -----------------

  getJournals: async () => {
    return await Journal.findAll({
      order: [['updated_at', 'DESC']],
      include: 'patient'
    });
  },

  getJournal: async (journalID) => {
    return await Journal.findByPk(journalID);
  },

  getFullJournal: async (journalID) => {
    const journal = await Journal.findByPk(
      journalID, {
        include: [
          'patient',
          {
            association: 'days', include:
            { association: 'meals', include: 'dishes' },
          }
        ]
      });
    if (!journal) return journal;

    journal.days.sort((a, b) => a.position - b.position); // Sorting days according to position
    // Using 'for of' here is important to be synchronous !
    for (const day of journal.days) {
      day.journal = journal;
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
    return journal;
  },

  /**
   * Find journals associated to a patient's id.
   * @param {Integer} patientID Patient's id
   * @returns {Array<Journal>} Matching journals array.
   */
  getPatientJournals: async (patientID) => {
    const patient = await Patient.findByPk(patientID);
    if (!patient) return [];
    const findData = {
      order: [['updated_at', 'DESC']],
      where: { patient_id: patientID },
      include: 'patient'
    };
    return await Journal.findAll(findData);
  },

  // -------------
  // API FUNCTIONS
  // -------------

  apiCreateJournal: async (req, res) => {
    const journalData = req.body;
    // Validate data
    const { patient_id } = journalData;
    if (patient_id !== undefined && !await patientController.getPatient(patient_id)) {
      const err = new Error(`Le patient ${patient_id} n'existe pas.`);
      err.status = 400;
      throw err;
    }
    const journal = await Journal.create(journalData);
    return res.json(journal);
  },

  apiUpdateJournal: async (req, res, next) => {
    const { id } = req.params;
    let journal = await journalController.getJournal(id);
    if (!journal) return next(); // 404
    // Converting empy values to null
    for (const prop in req.body) {
      req.body[prop] = req.body[prop] || null;
    }
    await journal.update(req.body);
    // Re-get journal in case patient_id has been changed.
    journal = await journalController.getJournal(id);
    res.json(journal);
  },

  apiGetJournals: async (req, res, next) => {
    let journals;
    if (req.query.patient !== undefined) {
      journals = await journalController.getPatientJournals(req.query.patient);
    } else {
      journals = await journalController.getJournals();
    }
    if (!journals) return next(); // patient id was provided but patient not found
    res.json(journals);
  },

  apiGetJournal: async (req, res, next) => {
    const journal = await journalController.getFullJournal(req.params.id);
    if (!journal) return next(); // 404
    res.json(journal);
  },

  // ---------------
  // PAGES FUNCTIONS
  // ---------------

  journalsPage: async (req, res, next) => {
    // Check if we want to filter by patient id
    const patientID = req.query.patient;
    let patient, journals;
    if (patientID !== undefined) {
      patient = await Patient.findByPk(patientID);
      if (!patient) return next(); // Patient id was provided but patient not found
      journals = await journalController.getPatientJournals(patientID);
    } else {
      journals = await journalController.getJournals();
    }
    if (!journals) return next();
    res.render('journals', { journals, patient });
  },

  journalPage: async (req, res, next) => {
    const journal = await journalController.getFullJournal(req.params.id);
    if (!journal) return next(); // 404
    res.render('journal', { journal });
  },

  createJournalPage: (req, res) => {
    res.render('createJournal');
  },

};

module.exports = journalController;
