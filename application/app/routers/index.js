const express = require('express');
const mainController = require('../controllers/mainController');

router = express.Router();

router.get('/', mainController.homePage);
router.get('/ciqualTable', mainController.ciqualTablePage);
router.get('/journals', mainController.journalsPage);
router.get('/journal/:id', mainController.journalPage);
router.get('/patients', mainController.patientsPage);
router.get('/patient/:id', mainController.patientPage);

router.use((req, res) => {
  res.status(404).render('404'); // 404
});

module.exports = router;