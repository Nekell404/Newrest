const express = require('express');

const checkCredentialsRoutesController = require('../controllers/checkCredentialsRoutesController');

const router = express.Router();

router.get('/username/:username', checkCredentialsRoutesController.username);
router.get('/email/:email', checkCredentialsRoutesController.email);
router.get('/api-key/:api_key', checkCredentialsRoutesController.api_key);
router.get('/usage-limit/api-key/:api_key', checkCredentialsRoutesController.usage_limit);

module.exports = router;