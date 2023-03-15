/* global module */
const express = require('express');
const { catchErrors, notFound, apiErrorsCollector } = require('../middlewares/handlers/errorHandlers');
const foodController = require('../controllers/foodController');
const journalController = require('../controllers/food_journal/journalController');
const dayController = require('../controllers/food_journal/dayController');
const mealController = require('../controllers/food_journal/mealController');
const dishController = require('../controllers/food_journal/dishController');
const patientController = require('../controllers/patientController');
const { sanitizeRequestBody } = require('../middlewares/handlers/sanitizer');

const router = express.Router();

// All routes here are assumed to be prefixed with '/api' (see app/server/index.js)
router
  .get('/foods', catchErrors(foodController.apiGetFoods))
  .get('/food/:id', catchErrors(foodController.apiGetFood));

router
  .get('/journals', catchErrors(journalController.apiGetJournals))
  .get('/journal/:id', catchErrors(journalController.apiGetJournal))
  .post('/journal', sanitizeRequestBody, catchErrors(journalController.apiCreateJournal))
  .patch('/journal/:id', sanitizeRequestBody, catchErrors(journalController.apiUpdateJournal))
  .delete('/journal/:id', catchErrors(journalController.apiDeleteJournal));

router
  .get('/days', catchErrors(dayController.apiGetDays))
  .get('/day/:id', catchErrors(dayController.apiGetDay))
  .post('/day', sanitizeRequestBody, catchErrors(dayController.apiCreateDay))
  .patch('/day/:id', sanitizeRequestBody, catchErrors(dayController.apiUpdateDay))
  .delete('/day/:id', catchErrors(dayController.apiDeleteDay));

router
  .get('/meals', catchErrors(mealController.apiGetMeals))
  .get('/meal/:id', catchErrors(mealController.apiGetMeal))
  .post('/meal', sanitizeRequestBody, catchErrors(mealController.apiCreateMeal))
  .patch('/meal/:id', sanitizeRequestBody, catchErrors(mealController.apiUpdateMeal))
  .delete('/meal/:id', catchErrors(mealController.apiDeleteMeal));

router
  .get('/dishes', catchErrors(dishController.apiGetDishes))
  .get('/dish/:id', catchErrors(dishController.apiGetDish))
  .post('/dish', sanitizeRequestBody, catchErrors(dishController.apiCreateDish))
  .patch('/dish/:id', sanitizeRequestBody, catchErrors(dishController.apiUpdateDish))
  .delete('/dish/:id', catchErrors(dishController.apiDeleteDish));

router
  .get('/patients', catchErrors(patientController.apiGetPatients))
  .get('/patient/:id', catchErrors(patientController.apiGetPatient))
  .post('/patient', sanitizeRequestBody, catchErrors(patientController.apiSubmitPatient))
  .delete('/patient/:id', catchErrors(patientController.apiDeletePatient));

// Error handlers specific to the '/api' routes
router.use(notFound);
router.use(apiErrorsCollector);

module.exports = router;