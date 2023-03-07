const express = require('express');
const { catchErrors, notFound, apiErrorsCollector } = require('../middlewares/handlers/errorHandlers');
const foodController = require('../controllers/foodController');
const journalController = require('../controllers/food_journal/journalController');
const dayController = require('../controllers/food_journal/dayController');
const patientController = require('../controllers/patientController');

router = express.Router();

// All routes here are assumed to be prefixed with '/api' (see app/server/index.js)
router
  .get('/foods', catchErrors(foodController.apiGetFoods));

router
  .get('/journals', catchErrors(journalController.apiGetJournals))
  .get('/journal/:id', catchErrors(journalController.apiGetJournal))
  .post('/journal', catchErrors(journalController.apiCreateJournal))
  .patch('/journal/:id', catchErrors(journalController.apiUpdateJournal));

router
  .get('/days', catchErrors(dayController.apiGetDays))
  .get('/day/:id', catchErrors(dayController.apiGetDay))
  .post('/day', catchErrors(dayController.apiCreateDay))
  .patch('/day/:id', catchErrors(dayController.apiUpdateDay));

router
  .get('/patients', catchErrors(patientController.apiGetPatients))
  .get('/patient/:id', catchErrors(patientController.apiGetPatient))
  .post('/patient', catchErrors(patientController.apiSubmitPatient));

// Error handlers specific to the '/api' routes
router.use(notFound);
router.use(apiErrorsCollector);

module.exports = router;