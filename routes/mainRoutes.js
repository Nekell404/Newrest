const express = require('express');
const router = express.Router();

const mainRoutesController = require('../controllers/mainRoutesController');

router.get('/', mainRoutesController.main);

module.exports = router;