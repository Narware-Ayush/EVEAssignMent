const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/centreController');

router.get('/', ctrl.listCentres);
router.get('/tests', ctrl.listTests);
router.get('/:id', ctrl.getCentre);

module.exports = router;