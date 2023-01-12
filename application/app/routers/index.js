const express = require('express');
const mainController = require('../controllers/mainController');

router = express.Router();

router.get('/', mainController.homePage);
router.get('/ciqualTable', mainController.ciqualTablePage);
router.get('/journals', mainController.journalsPage);

router.use((req, res) => {
  res.status(404).render('404'); // 404
});

module.exports = router;