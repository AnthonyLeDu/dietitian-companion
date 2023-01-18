const express = require('express');
const journalController = require('../controllers/journalController');
const mainController = require('../controllers/mainController');
const patientController = require('../controllers/patientController');

router = express.Router();

router.get('/', mainController.homePage);
router.get('/ciqualTable', mainController.ciqualTablePage);

router.get('/journals', journalController.journalsPage);
router.get('/journal/:id', journalController.journalPage);

router.get('/patients', patientController.patientsPage);
router.get('/patient/:id', patientController.patientPage);

router.use((req, res) => {
  res.status(404).render('404'); // 404
});

module.exports = router;