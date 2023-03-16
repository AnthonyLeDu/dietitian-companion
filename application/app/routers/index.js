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
  .get('/journal/:id', catchErrors(journalController.journalPage))
  .get('/journal/delete/:id', catchErrors(journalController.deleteJournal));

router
  .get('/patient/create', catchErrors(patientController.createPatientPage))
  .post('/patient/create', sanitizeRequestBody, catchErrors(patientController.submitPatient))
  .get('/patients', catchErrors(patientController.patientsPage))
  .get('/patient/:id', catchErrors(patientController.patientPage));


module.exports = router;