const { Journal, Patient } = require('../models');

const journalController = {

  // -----------------
  // GENERIC FUNCTIONS
  // -----------------

  getJournals: async() => {
    return await Journal.findAll({
      order: [['updated_at', 'DESC']],
      include: 'patient'
    });
  },

  getJournal: async(journalID) => {
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
    if (!journal) {
      return undefined;
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
    return journal;
  },

  /**
   * Find journals assocaited to a patient's id.
   * If provided id corresponds to no patient, returns a [undefined, undefined] array.
   * @param {Integer} patientID Patient's id
   * @returns {Array<Patient, Journal[]>} Patient instance and its Journals array.
   */
  getPatientJournals: async(patientID) => {
    const patient = await Patient.findByPk(patientID);
    if (!patient) return [undefined, undefined]; // 404
    const findData = {
      order: [['updated_at', 'DESC']],
      // Use of 'association' is important here because we may add 'where' below
      include: {
        association: 'patient',
        where: { id: patientID }
      }
    }
    const journals = await Journal.findAll(findData);
    return [patient, journals];
  },

  // -------------
  // API FUNCTIONS
  // -------------

  apiGetJournals: async(req, res, next) => {
    let journals, patient;
    if (req.query.patient !== undefined) {
      [patient, journals] = await journalController.getPatientJournals(req.query.patient);
    } else {
      journals = await journalController.getJournals();
    }
    if (!journals) return next(); // patient id was provided but patient not found
    res.json(journals);
  },

  apiGetJournal: async(req, res, next) => {
    const journal = await journalController.getJournal(req.params.id);
    if (!journal) return next(); // 404
    res.json(journal);
  },

  // ---------------
  // PAGES FUNCTIONS
  // ---------------

  journalsPage: async (req, res, next) => {
    // Check if we want to filter by patient id
    const patientID = req.query.patient;
    let patient;
    if (patientID !== undefined) {
      patient = await Patient.findByPk(patientID);
      if (!patient) return next(); // Patient id was provided but patient not found
    }
    const journals = await journalController.getJournals(patientID);
    if (!journals) return next(); 
    res.render('journals', { journals, patient });
  },

  journalPage: async (req, res, next) => {
    const journal = await journalController.getJournal(req.params.id);
    if (!journal) return next(); // 404
    res.render('journal', { journal });
  },

  createJournalPage: (req, res) => {
    res.render('createJournal');
  },

}

module.exports = journalController;
