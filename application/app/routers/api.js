/* global module */
const express = require('express');
const { catchErrors, notFound, apiErrorsCollector } = require('../middlewares/handlers/errorHandlers');
const foodController = require('../controllers/foodController');
const journalController = require('../controllers/food_journal/journalController');
const dayController = require('../controllers/food_journal/dayController');
const mealController = require('../controllers/food_journal/mealController');
const dishController = require('../controllers/food_journal/dishController');
const patientController = require('../controllers/patientController');

const router = express.Router();

// All routes here are assumed to be prefixed with '/api' (see app/server/index.js)
router
  .get('/foods', catchErrors(foodController.apiGetFoods))
  .get('/food/:id', catchErrors(foodController.apiGetFood));

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
  .get('/meals', catchErrors(mealController.apiGetMeals))
  .get('/meal/:id', catchErrors(mealController.apiGetMeal))
  .post('/meal', catchErrors(mealController.apiCreateMeal))
  .patch('/meal/:id', catchErrors(mealController.apiUpdateMeal));

router
  .get('/dishes', catchErrors(dishController.apiGetDishes))
  .get('/dish/:id', catchErrors(dishController.apiGetDish))
  .post('/dish', catchErrors(dishController.apiCreateDish))
  .patch('/dish/:id', catchErrors(dishController.apiUpdateDish));

router
  .get('/patients', catchErrors(patientController.apiGetPatients))
  .get('/patient/:id', catchErrors(patientController.apiGetPatient))
  .post('/patient', catchErrors(patientController.apiSubmitPatient));

// Error handlers specific to the '/api' routes
router.use(notFound);
router.use(apiErrorsCollector);

module.exports = router;