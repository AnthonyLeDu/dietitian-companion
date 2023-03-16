/* global module */
const dayjs = require('dayjs');
const { Patient } = require('../models');

const DEFAULT_FORM_DATA = {
  patient: {},
  maxDate: dayjs().format('YYYY-MM-DD'),
};

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

  patchPatient: async (patientId, patientData) => {
    let patient, statusCode, feedbackMessage;
    patientData.birth_date = new Date(patientData.birth_date);

    // Check that patient exists
    patient = await patientController.getPatient(patientId);
    if (!patient) {
      statusCode = 404;
      feedbackMessage = 'Ce patient n\'existe pas !';
    } else {
      patient = await patient.update(patientData);
      if (patient) {
        statusCode = 200;
        feedbackMessage = 'Patient mis à jour avec succès !';
      } else {
        statusCode = 500;
        feedbackMessage = 'Désolé, le patient n\'a pas pu être mis à jour. Veuillez réessayer plus tard.';
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
    res.render('createPatient', DEFAULT_FORM_DATA);
  },

  submitPatient: async (req, res) => {
    const { statusCode, feedbackMessage } = await patientController.createPatient(req.body);
    // Refresh page with feedback message
    res.status(statusCode).render('createPatient', {
      ...DEFAULT_FORM_DATA,
      feedbackMessage,
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

  editPatientPage: async (req, res, next) => {
    const patient = await patientController.getPatient(req.params.id);
    if (!patient) return next(); // 404
    res.render('editPatient', {
      maxDate: dayjs().format('YYYY-MM-DD'),
      patient
    });
  },

  updatePatient: async (req, res) => {
    const { patient, statusCode, feedbackMessage } = await patientController.patchPatient(
      req.params.id,
      req.body
    );
    // Refresh page with feedback message
    res.status(statusCode).render('editPatient', {
      ...DEFAULT_FORM_DATA,
      feedbackMessage,
      patient
    });
  },

  deletePatient: async (req, res, next) => {
    const { id } = req.params;
    const patient = await patientController.getPatient(id);
    if (!patient) return next(); // 404
    patient.destroy();
    res.redirect('/patients');
  },

};

module.exports = patientController;
