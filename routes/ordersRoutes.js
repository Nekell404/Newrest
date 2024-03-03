const express = require('express');

const ordersRoutesController = require('../controllers/ordersRoutesController');

const router = express.Router();

router.get('/', ordersRoutesController.main);
router.get('/plan', ordersRoutesController.plan);
router.get('/plan/checkout', ordersRoutesController.plan_checkout);
router.get('/plan/checkout/pay', ordersRoutesController.plan_checkout_payment_method);

module.exports = router;