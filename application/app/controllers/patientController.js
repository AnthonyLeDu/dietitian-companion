/* global module */
const dayjs = require('dayjs');
const { Patient } = require('../models');

const patientController = {

  // -----------------
  // GENERIC FUNCTIONS
  // -----------------
  getPatients: () => {
    return Patient.findAll({
      order: [['last_name'], ['first_name']],
      include: 'journals'
    });
  },

  getPatient: (patientID) => {
    return Patient.findByPk(
      patientID,
      { include: 'journals' }
    );
  },

  createPatient: async (patientData) => {
    let patient, statusCode, feedbackMessage;
    patientData.birth_date = new Date(patientData.birth_date);

    // Check that patient does not exist yet
    if (await Patient.findOne({ where: patientData })) {
      statusCode = 409;
      feedbackMessage = 'Ce patient existe déjà !';
    } else {
      // Create the patient
      patient = await Patient.create(patientData);
      if (patient) {
        statusCode = 200;
        feedbackMessage = 'Patient créé avec succès !';
      } else {
        statusCode = 500;
        feedbackMessage = 'Désolé, le patient n\'a pas pu être créé. Veuillez réessayer plus tard.';
      }
    }
    return { patient, statusCode, feedbackMessage };
  },

  // -------------
  // API FUNCTIONS
  // -------------
  apiGetPatients: async (req, res) => {
    const patients = await patientController.getPatients();
    res.json(patients);
  },

  apiGetPatient: async (req, res, next) => {
    const patient = await patientController.getPatient(req.params.id);
    if (!patient) return next(); // 404
    res.json(patient);
  },

  apiSubmitPatient: async (req, res) => {
    const { patient, statusCode, feedbackMessage } = await patientController.createPatient(req.body);
    res.statusCode = statusCode;
    if (patient) {
      return res.json(patient);
    } else {
      const error = new Error(feedbackMessage);
      error.status = statusCode;
      throw error;
    }
  },

  apiDeletePatient: async (req, res, next) => {
    const { id } = req.params;
    const patient = await patientController.getPatient(id);
    if (!patient) return next(); // 404
    patient.destroy();
    res.status(204).json({});
  },

  // ---------------
  // PAGES FUNCTIONS 
  // ---------------

  createPatientPage: async (req, res) => {
    res.render('createPatient', { maxDate: dayjs().format('YYYY-MM-DD') });
  },

  submitPatient: async (req, res) => {
    const { statusCode, feedbackMessage } = await patientController.createPatient(req.body);
    // Refresh page with feedback message
    res.status(statusCode).render('createPatient', {
      maxDate: dayjs().format('YYYY-MM-DD'),
      feedbackMessage
    });
  },

  patientsPage: async (req, res) => {
    const patients = await patientController.getPatients();
    res.render('patients', { patients });
  },

  patientPage: async (req, res, next) => {
    const patient = await patientController.getPatient(req.params.id);
    if (!patient) return next(); // 404
    res.render('patient', { patient });
  },

};

module.exports = patientController;
