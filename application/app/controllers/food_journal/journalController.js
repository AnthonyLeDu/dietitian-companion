/* global module */
// eslint-disable-next-line no-unused-vars
const { Journal, Patient } = require('../../models');
const patientController = require('../patientController');
const nutrientsData = require('../../data/nutrientsData.json');

/**
 * Given a journal instance, returns the corresponding recommended daily intakes.
 * @param {Journal} journal
 * @returns Recommended intakes object
 */
const getRecommendedIntakes = function(journal) {
  // Calculate recommended daily income if enough info provided
  const recommended_intakes = {};
  if (!journal.patient || journal.patient_age === undefined) return journal;

  const patientAge = journal.patient_age * 12; // In months
  for (const nutrientData of nutrientsData) {
    if (!nutrientData.recommended_intake) continue;
    let amount;
    const populations = nutrientData.recommended_intake.populations;
    // Is pregnant ?
    if (journal.patient_pregnant && Object.prototype.hasOwnProperty.call(populations, 'pregnant')) {
      amount = populations.pregnant;
    }
    // Is nursing ?
    else if (journal.patient_nursing && Object.prototype.hasOwnProperty.call(populations, 'nursing')) {
      amount = populations.nursing;
    }
    // Using age (in months)
    else {
      const populationAges = Object.keys(populations)
        .map((key) => Number(key))
        .filter((key) => !isNaN(key)) // Keep only numbers and remove 'pregnant', 'nursing', etc.
        .sort((a, b) => b - a); // Reverse sort

      let matchingAge = populationAges.find((populationAge) => populationAge <= patientAge); // Finding the first age below the journal's patient age.
      if (matchingAge) {
        matchingAge = String(matchingAge);
        if (typeof populations[matchingAge] === 'number') {
          amount = populations[matchingAge];
        }
        else { // There is a gender sub-object (male of female)
          const genderData = populations[matchingAge][journal.patient.gender];
          if (typeof genderData === 'number') {
            amount = genderData;
          }
          else { // There is a specificities sub-object (menopausal or heavy_menses)
            if (journal.patient_menopausal && Object.prototype.hasOwnProperty.call(genderData, 'menopausaul')) {
              amount = genderData.menopausaul;
            }
            else if (journal.patient_heavy_menses && Object.prototype.hasOwnProperty.call(genderData, 'heavy_menses')) {
              amount = genderData.heavy_menses;
            }
            // No matching specificities, using standard value if found
            else if (Object.prototype.hasOwnProperty.call(genderData, 'standard')) {
              amount = genderData.standard;
            }
          }
        }
      }
    }

    recommended_intakes[nutrientData.dbName] = {
      'unit': nutrientData.recommended_intake.unit,
      'amount': amount
    };
    console.log(nutrientData.dbName, amount, nutrientData.recommended_intake.unit);
  }
  return recommended_intakes;
};

const journalController = {

  // -----------------
  // GENERIC FUNCTIONS
  // -----------------

  getJournals: async () => {
    return await Journal.findAll({
      order: [['updated_at', 'DESC']],
      include: 'patient',
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
      for (const meal of day.meals) {
        meal.dishes.sort((a, b) => a.position - b.position); // Sorting dishes according to position
        for (const dish of meal.dishes) {
          await dish.fetchFood();
        }
      }
    }
    await journal.getNutrients();
    
    journal.recommended_intakes = getRecommendedIntakes(journal);
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

  apiDeleteJournal: async (req, res, next) => {
    const { id } = req.params;
    const journal = await journalController.getJournal(id);
    if (!journal) return next(); // 404
    journal.destroy();
    res.status(204).json({});
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
    // console.log(JSON.stringify(journal, null, 2));
    if (!journal) return next(); // 404
    res.render('journal', { journal });
  },

  createJournalPage: async (req, res) => {
    res.render('createJournal');
  },

  editJournalPage: async (req, res) => {
    res.render('editJournal');
  },

  deleteJournal: async (req, res, next) => {
    const { id } = req.params;
    const journal = await journalController.getJournal(id);
    if (!journal) return next(); // 404
    journal.destroy();
    res.redirect('/journals');
  },

};

module.exports = journalController;
