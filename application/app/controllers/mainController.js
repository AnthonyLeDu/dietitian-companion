const { Food } = require('../models/ciqual/');
const { Journal, Patient } = require('../models/food_journal/');

const mainController = {

  homePage: async (req, res) => {
    res.render('index');
  },

  patientsPage: async (req, res) => {
    const patients = await Patient.findAll({
      order: [['last_name', 'DESC'], ['first_name', 'DESC']],
      include: { association: 'journals' }
    });
    res.render('patients', { patients });
  },

  patientPage: async (req, res, next) => {
    const patient = await Patient.findByPk(
      req.params.id, {
      include: { association: 'journals' }
    }
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
      include: {
        association: 'patient'
      }
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

  ciqualTablePage: async (req, res) => {
    const foods = await Food.findAll({
      include: ['food_grp', 'food_ssgrp', 'food_ssssgrp'],
    });
    res.render('ciqualTable', { foods });
  }

}

module.exports = mainController;
