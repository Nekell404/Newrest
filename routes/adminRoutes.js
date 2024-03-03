require('../config/appConfig');

const express = require('express');

const adminRoutesController = require('../controllers/adminRoutesController');

const router = express.Router();

function checkAuth(req, res, next) {
  const password = req.query.password;

  if (password === password_admin) {
    req.isAdmin = true;
    next();
  } else {
    req.isAdmin = false;
    next();
  }
}

router.get('/', checkAuth, adminRoutesController.get_main);

// Admin dashboard
router.get('/dashboard', checkAuth, adminRoutesController.get_dashboard);

// Admin panel
router.get('/panel', checkAuth, adminRoutesController.get_panel);
router.post('/panel/broadcast', checkAuth, adminRoutesController.post_broadcast);
router.post('/panel/add-user', checkAuth, adminRoutesController.post_add_user);
router.post('/panel/update-data', checkAuth, adminRoutesController.post_update_data);
router.post('/panel/delete-data', checkAuth, adminRoutesController.post_delete_data);

module.exports = router;