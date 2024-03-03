const express = require('express');

const { checkAuth } = require('../utils/functions');
const pagesRoutesController = require('../controllers/pagesRoutesController');

const router = express.Router();

// Pages
router.get('/', pagesRoutesController.home);
router.get('/dashboard', checkAuth, pagesRoutesController.dashboard);
router.get('/plans', checkAuth, pagesRoutesController.plans);
router.get('/profile', checkAuth, pagesRoutesController.profile);
router.post('/profile/update/data', checkAuth, pagesRoutesController.profile_update_data);
router.post('/profile/update/api-key', checkAuth, pagesRoutesController.profile_update_api_key);
router.post('/profile/delete/account', checkAuth, pagesRoutesController.profile_delete_account);

// API features
router.get('/downloader', checkAuth, pagesRoutesController.features_downloader);
router.get('/searcher', checkAuth, pagesRoutesController.features_searcher);
router.get('/stalker', checkAuth, pagesRoutesController.features_stalker);
router.get('/artificial-intelligence', checkAuth, pagesRoutesController.features_artificial_intelligence);
router.get('/canvas', checkAuth, pagesRoutesController.features_canvas);
router.get('/maker', checkAuth, pagesRoutesController.features_maker);
router.get('/photooxy', checkAuth, pagesRoutesController.features_photooxy);
router.get('/random-image', checkAuth, pagesRoutesController.features_random_image);
router.get('/check-nickname', checkAuth, pagesRoutesController.features_check_nickname);
router.get('/url-shortener', checkAuth, pagesRoutesController.features_url_shortener);
router.get('/converter', checkAuth, pagesRoutesController.features_converter);
router.get('/tools', checkAuth, pagesRoutesController.features_tools);
router.get('/all-features', checkAuth, pagesRoutesController.features_all_features);

// Count area
router.get('/total-users-count', pagesRoutesController.total_users_count);
router.get('/total-visits-count', pagesRoutesController.total_visits_count);
router.get('/total-daily-requests-count', pagesRoutesController.total_daily_requests_count);
router.get('/total-requests-count', pagesRoutesController.total_requests_count);

// Help
router.get('/help', pagesRoutesController.help);
router.get('/documentation', pagesRoutesController.documentation);
router.get('/contact-support', pagesRoutesController.contact_support);

module.exports = router;