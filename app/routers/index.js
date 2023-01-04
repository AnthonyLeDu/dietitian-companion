const express = require('express');

router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

/**
 * 404
 */
router.use((req, res) => {
  res.status(404).render('404');
});

module.exports = router;