require('../config/appConfig');

const bcrypt = require('bcryptjs');

const {
  checkAuth,
  formatDateToString
} = require('../utils/functions');
const cwd = require('../utils/current-working-directory');
const {
  sendBroadcastEmails
} = require('./nodeMailerController');
const db = require('./mySQLController');

exports.get_main = (req, res) => {
  const sessionUsername = req.session.username;

  if (req.isAdmin) { 
  res.status(200).send(`
<h1>Admin area</h1>
<br>
<button onclick="location.href = '/admin/dashboard?password=${password_admin}';">Admin dashboard</button>
<br><br>
<button onclick="location.href = '/admin/panel?password=${password_admin}';">Admin panel</button>
`);
} else {
    res.status(401).send(`<script>
const pw = prompt('Enter password');
location.href = '/admin?password=' + pw;
</script>`);
  }
};

// Admin dashboard
exports.get_dashboard = (req, res) => {
  const sessionUsername = req.session.username;

  if (req.isAdmin) {
    db.query('SELECT * FROM users', (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Terjadi kesalahan pada server.');
      }

      if (result.length > 0) {
        const users = result;
        res.render('admin-dashboard', {
          users
        });
      } else {
        res.send('<p>No users found!</p>');
      }
    });
  } else {
    res.status(401).send('Unauthorized');
  }
};

// Admin panel
exports.get_panel = (req, res) => {
  const sessionUsername = req.session.username;

  if (req.isAdmin) {
    db.query('SELECT * FROM users', (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Terjadi kesalahan pada server.');
      }
      
      if (result.length > 0) {
        const users = result;
        res.render('admin-panel', {
          users,
          formatDateToString
        });
      } else {
        res.send('<p>No users found!</p>');
      }
    });
  } else {
    res.status(401).send('Unauthorized');
  }
};

exports.post_broadcast = (req, res) => {
  const {
    subject,
    message
  } = req.body;

  db.query('SELECT email FROM users', (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const emails = result.map(user => user.email);

      sendBroadcastEmails(emails, subject, message, (error) => {
        if (error) {
          console.log('Gagal mengirim pesan siaran:', error);
          res.send(`<script>alert('Gagal mengirim pesan siaran'); location.href = '/admin/panel?password=${password_admin}';</script>`);
        } else {
          console.log('Pesan siaran terkirim');
          res.send(`<script>alert('Pesan siaran terkirim'); location.href = '/admin/panel?password=${password_admin}';</script>`);
        }
      });
    } else {
      res.send('<p>Tidak ada pengguna yang ditemukan</p>');
    }
  });
}

exports.post_add_user = (req, res) => {
  const {
    username,
    email,
    password,
    account_type,
    api_key
  } = req.body;

  const planLimits = {
    Free: usage_limit_amount.free,
    Basic: usage_limit_amount.basic,
    Standard: usage_limit_amount.standard,
    Premium: usage_limit_amount.premium,
    Enterprise: usage_limit_amount.enterprise
  };

  const usage_limit = planLimits[account_type];

  db.query(
    'INSERT INTO users (username, email, password, account_type, api_key, usage_limit, otp_verified) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [username, email, password, account_type, api_key, usage_limit],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Terjadi kesalahan pada server.');
      }

      res.redirect('/admin/panel?password=' + password_admin);
    }
  );
};

exports.post_update_data = (req, res) => {
  const {
    userId,
    username,
    email,
    password,
    account_type,
    api_key,
    usage_limit,
    expired_date
  } = req.body;

  const currentDate = new Date();
  const expiredPlanDate = new Date(currentDate);
  expiredPlanDate.setMonth(expiredPlanDate.getMonth() + 1);

  const saltRounds = 10;

  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Failed to hash the new password:', err);
      return res.status(500).send('An error occurred on the server.');
    }

    db.query('SELECT account_type FROM users WHERE id = ?', [userId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('An error occurred on the server.');
      }

      const currentAccountType = result[0].account_type;

      let updatedData;
      if (account_type !== currentAccountType) {
        const planLimits = {
          Free: usage_limit_amount.free,
          Basic: usage_limit_amount.basic,
          Standard: usage_limit_amount.standard,
          Premium: usage_limit_amount.premium,
          Enterprise: usage_limit_amount.enterprise
        };

        updatedData = {
          account_type: account_type,
          edit_api_key_count: 0,
          usage_limit: planLimits[account_type],
          last_updated_date: currentDate,
          expired_date: expiredPlanDate
        };
      } else {
        updatedData = {
          username: username,
          email: email,
          password: hashedPassword,
          api_key: api_key,
          usage_limit: usage_limit,
          last_updated_date: currentDate
        };

        if (expired_date) {
          updatedData.expired_date = expired_date;
        }
      }

      db.query('UPDATE users SET ? WHERE id = ?', [updatedData, userId], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).send('An error occurred on the server.');
        }

        res.redirect('/admin/panel?password=' + password_admin);
      });
    });
  });
};

exports.post_delete_data = (req, res) => {
  const userId = req.body.userId;

  db.query('DELETE FROM users WHERE id = ?',
    [userId],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Terjadi kesalahan pada server.');
      }

      res.redirect('/admin/panel?password=' + password_admin);
    });
};