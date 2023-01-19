const { Journal, Patient } = require('../models');

const journalController = {

  journalsPage: async (req, res, next) => {
    const findData = {
      order: [['updated_at', 'DESC']],
      // 'association' is important here because we may add 'where' below
      include: { association: 'patient' }
    }
    // Check if we want to filter by patient id
    const patient_id = req.query.patient;
    let patient;
    if (patient_id !== undefined) {
      patient = await Patient.findByPk(patient_id);
      if (!patient) return next(); // 404
      findData.include.where = { id: patient_id };
    }
    const journals = await Journal.findAll(findData);
    res.render('journals', { journals, patient });
  },

  journalPage: async (req, res, next) => {
    const journal = await Journal.fetchByPkWithCalculations(req.params.id);
    if (!journal) return next(); // 404
    res.render('journal', { journal });
  },

}

module.exports = journalController;
