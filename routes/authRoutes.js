const express = require('express');

const authRoutesController = require('../controllers/authRoutesController');
const { checkAuth, checkLoggedIn } = require('../utils/functions');

const router = express.Router();

// GET area
router.get('/login', checkLoggedIn, authRoutesController.get_login);
router.get('/signup', checkLoggedIn, authRoutesController.get_signup);
router.get('/logout', checkAuth, authRoutesController.get_logout);
router.get('/verify-otp', checkLoggedIn, authRoutesController.get_verify_otp);
router.get('/forgot-password', checkLoggedIn, authRoutesController.get_forgot_password);
router.get('/recover-password/:token', authRoutesController.get_recover_password);

// POST area
router.post('/login', authRoutesController.post_login);
router.post('/signup', authRoutesController.post_signup);
router.post('/verify-otp', authRoutesController.post_verify_otp);
router.post('/forgot-password', authRoutesController.post_forgot_password);
router.post('/recover-password/:token', authRoutesController.post_recover_password);

module.exports = router;