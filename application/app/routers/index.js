const express = require('express');
const { catchErrors } = require('../middlewares/handlers/errorHandlers');
const mainController = require('../controllers/mainController');
const foodController = require('../controllers/foodController');
const journalController = require('../controllers/journalController');
const patientController = require('../controllers/patientController');

router = express.Router();

router.get('/', catchErrors(mainController.homePage));

router.get('/foods', catchErrors(foodController.foodsPage));

router.get('/journals', catchErrors(journalController.journalsPage));
router.get('/journal/create', catchErrors(journalController.createJournalPage));
router.get('/journal/:id', catchErrors(journalController.journalPage));

router.get('/patient/create', catchErrors(patientController.createPatientPage));
router.post('/patient/create', catchErrors(patientController.submitPatient));
router.get('/patients', catchErrors(patientController.patientsPage));
router.get('/patient/:id', catchErrors(patientController.patientPage));


module.exports = router;