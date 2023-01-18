const { Patient } = require('../models');

const patientController = {

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

}

module.exports = patientController;
