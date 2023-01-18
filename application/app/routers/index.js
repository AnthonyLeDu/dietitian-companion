const express = require('express');
const { catchErrors } = require('../middlewares/handlers/errorHandlers');
const journalController = require('../controllers/journalController');
const mainController = require('../controllers/mainController');
const patientController = require('../controllers/patientController');

router = express.Router();

router.get('/', catchErrors(mainController.homePage));
router.get('/ciqualTable', catchErrors(mainController.ciqualTablePage));

router.get('/journals', catchErrors(journalController.journalsPage));
router.get('/journal/:id', catchErrors(journalController.journalPage));

router.get('/patients', catchErrors(patientController.patientsPage));
router.get('/patient/:id', catchErrors(patientController.patientPage));

module.exports = router;