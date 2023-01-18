const dayjs = require('dayjs');
const { Patient } = require('../models');

const patientController = {

  createPatientPage: async (req, res) => {
    res.render('createPatient', { maxDate: dayjs().format('YYYY-MM-DD') });
  },

  createPatient: async (req, res) => {
    let feedbackMessage;
    const { first_name, last_name, gender } = req.body;
    const birth_date = new Date(req.body.birth_date);
    const patientData = { first_name, last_name, gender, birth_date };

    // Check that patient does not exist yet
    if (await Patient.findOne({ where: patientData })) {
      res.statusCode = 409;
      feedbackMessage = 'Ce patient existe déjà !';
    } else {
      // Create the patient
      if (await Patient.create(patientData)) {
        res.statusCode = 200;
        feedbackMessage = 'Patient créé avec succès !';
      } else {
        res.statusCode = 500;
        feedbackMessage = 'Désolé, le patient n\'a pas pu être créé. Veuillez réessayer plus tard.'
      }
    }
    // Refresh page with feedback message
    res.render('createPatient', {
      maxDate: dayjs().format('YYYY-MM-DD'),
      feedbackMessage
    });
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
      return next(); // 404
    }
    res.render('patient', { patient });
  },

}

module.exports = patientController;
