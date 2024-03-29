/* global module */
const express = require('express');
const { catchErrors } = require('../middlewares/handlers/errorHandlers');
const { sanitizeRequestBody } = require('../middlewares/handlers/sanitizer');
const mainController = require('../controllers/mainController');
const foodController = require('../controllers/foodController');
const journalController = require('../controllers/food_journal/journalController');
const patientController = require('../controllers/patientController');

const router = express.Router();

router.get('/', catchErrors(mainController.homePage));

router.get('/foods', catchErrors(foodController.foodsPage));

router
  .get('/journals', catchErrors(journalController.journalsPage))
  .get('/journal/create', catchErrors(journalController.createJournalPage))
  .get('/journal/edit/:id', catchErrors(journalController.editJournalPage))
  .get('/journal/:id', catchErrors(journalController.journalPage))
  .get('/journal/delete/:id', catchErrors(journalController.deleteJournal));
  
router
  .get('/patient/create', catchErrors(patientController.createPatientPage))
  .post('/patient/create', sanitizeRequestBody, catchErrors(patientController.submitPatient))
  .get('/patient/edit/:id', catchErrors(patientController.editPatientPage))
  .post('/patient/edit/:id', catchErrors(patientController.updatePatient))
  .get('/patients', catchErrors(patientController.patientsPage))
  .get('/patient/:id', catchErrors(patientController.patientPage))
  .get('/patient/delete/:id', catchErrors(patientController.deletePatient));


module.exports = router;