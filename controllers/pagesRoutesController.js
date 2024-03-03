require('../config/appConfig');

const bcrypt = require('bcryptjs');
const fs = require('fs');

const {
  checkAuth
} = require('../utils/functions');
const cwd = require('../utils/current-working-directory');

const db = require('./mySQLController');

// Pages area
exports.home = (req, res) => {
  const userCountQuery = "SELECT COUNT(*) AS userCount FROM users;";
  const totalRequestsQuery = "SELECT SUM(total_requests) AS totalRequestsSum FROM request_logs;";

  db.query(userCountQuery, (errUserCount, userCountResult) => {
    if (errUserCount) {
      console.error(errUserCount);
      return;
    }

    db.query(totalRequestsQuery, (errTotalRequests, totalRequestsResult) => {
      if (errTotalRequests) {
        console.error(errTotalRequests);
        return;
      }

      const userCount = userCountResult[0].userCount || 0;
      const totalRequestsCount = totalRequestsResult[0].totalRequestsSum || 0;

      res.render('pages-home', {
        userCount,
        totalRequestsCount
      });
    });
  });
};

exports.dashboard = (req, res) => {
  const username = req.session.username;
  const currentDate = new Date();
  const jakartaOffset = +7 * 60;
  const jakartaTime = new Date(currentDate.getTime() + jakartaOffset * 60000);

  const currentDateString = jakartaTime.toISOString().split('T')[0];
  const serverStartTime = req.app.locals.serverStartTime;
  const activeTimeInSeconds = Math.floor((currentDate - serverStartTime) / 1000);

  db.query(
    'INSERT INTO visitors (username, last_visited) VALUES (?, ?) ON DUPLICATE KEY UPDATE visits = visits + 1, last_visited = ?',
    [username, currentDate, currentDate],
    (err, insertResult) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Terjadi kesalahan pada server.');
      }

      db.query('SELECT * FROM users WHERE username = ?', [username], (err, userResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Terjadi kesalahan pada server.');
        }

        db.query('SELECT COUNT(*) AS userCount FROM users', (err, userCountResult) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan pada server.');
          }

          db.query('SELECT SUM(visits) AS visitorCount FROM visitors', (err, visitorCountResult) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Terjadi kesalahan pada server.');
            }

            db.query(
              'SELECT SUM(daily_requests) AS dailyRequestsSum FROM request_logs WHERE date = ?',
              [currentDateString],
              (err, dailyRequestsResult) => {
                if (err) {
                  console.error(err);
                  return res.status(500).send('Terjadi kesalahan pada server.');
                }

                db.query('SELECT SUM(total_requests) AS totalRequestsSum FROM request_logs', (err, totalRequestsResult) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).send('Terjadi kesalahan pada server.');
                  }

                  const api_key = userResult[0].api_key;

                  db.query('SELECT SUM(daily_requests) AS dailyRequestSum FROM request_logs WHERE api_key = ? AND date = ?', [api_key, currentDateString], (err, dailyRequestResult) => {
                    if (err) {
                      console.error(err);
                      return res.status(500).send('Terjadi kesalahan pada server.');
                    }

                    db.query('SELECT SUM(daily_requests) AS totalRequestSum FROM request_logs WHERE api_key = ?', [api_key], (err, totalRequestResult) => {
                      if (err) {
                        console.error(err);
                        return res.status(500).send('Terjadi kesalahan pada server.');
                      }

                      if (userResult.length > 0) {
                        const user = userResult[0];
                        const userCount = userCountResult[0].userCount || 0;
                        const visitsCount = visitorCountResult[0].visitorCount || 0;
                        const dailyRequestCount = dailyRequestResult[0].dailyRequestSum || 0;
                        const totalRequestCount = totalRequestResult[0].totalRequestSum || 0;
                        const dailyRequestsCount = dailyRequestsResult[0].dailyRequestsSum || 0;
                        const totalRequestsCount = totalRequestsResult[0].totalRequestsSum || 0;

                        res.render('pages-dashboard', {
                          user,
                          userCount,
                          dailyRequestCount,
                          totalRequestCount,
                          dailyRequestsCount,
                          totalRequestsCount,
                          visitsCount,
                          activeTimeInSeconds
                        });
                      } else {
                        res.send(`<p>Tidak ada pengguna yang ditemukan!</p>`);
                      }
                    });
                  });
                });
              }
            );
          });
        });
      });
    }
  );
};

exports.plans = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('pages-plans', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.profile = (req, res) => {
  const username = req.session.username;
  
  const currentDate = new Date();
  const jakartaOffset = +7 * 60;
  const jakartaTime = new Date(currentDate.getTime() + jakartaOffset * 60000);
  const currentDateString = jakartaTime.toISOString().split('T')[0];
  
  db.query('SELECT api_key FROM users WHERE username = ?', [username], (err, userResult) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (userResult.length > 0) {
      const api_key = userResult[0].api_key;

      db.query('SELECT SUM(daily_requests) AS totalRequests FROM request_logs WHERE api_key = ?', [api_key], (err, totalResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Terjadi kesalahan pada server.');
        }

        const totalRequestCount = totalResult[0].totalRequests || 0;

        db.query('SELECT daily_requests FROM request_logs WHERE api_key = ? AND date = ?', [api_key, currentDateString], (err, todayResult) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan pada server.');
          }

          const dailyRequestCount = todayResult.length > 0 ? todayResult[0].daily_requests : 0;

          db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Terjadi kesalahan pada server.');
            }

            if (result.length > 0) {
              const user = result[0];

              res.render('pages-profile', {
                user,
                dailyRequestCount,
                totalRequestCount
              });
            } else {
              res.send(`<p>No user found!</p>`);
            }
          });
        });
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.profile_update_data = (req, res) => {
  const {
    username,
    email,
    password
  } = req.body;
  const sessionUsername = req.session.username;

  db.query('SELECT * FROM users WHERE username = ? AND username <> ?', [username, sessionUsername], (err, usernameResults) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    db.query('SELECT * FROM users WHERE email = ? AND username <> ?', [email, sessionUsername], (err, emailResults) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Terjadi kesalahan pada server.');
      }

      if (usernameResults.length > 0) {
        return res.status(400).send(`<script>alert('Username sudah digunakan.'); window.location.href = '/profile';</script>`);
      }

      if (emailResults.length > 0) {
        return res.status(400).send(`<script>alert('Email sudah digunakan.'); window.location.href = '/profile';</script>`);
      }

      const updatedData = {};
      if (username) updatedData.username = username;
      if (email) updatedData.email = email;

      if (password) {
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
          if (err) {
            console.error('Gagal menghash password baru:', err);
            return res.status(500).send('Terjadi kesalahan pada server.');
          }

          updatedData.password = hashedPassword;

          db.query('UPDATE users SET ? WHERE username = ?', [updatedData, sessionUsername], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Terjadi kesalahan pada server.');
            }

            if (updatedData.username) {
              req.session.username = updatedData.username;
            }

            res.redirect('/profile');
          });
        });
      } else {
        db.query('UPDATE users SET ? WHERE username = ?', [updatedData, sessionUsername], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan pada server.');
          }

          if (updatedData.username) {
            req.session.username = updatedData.username;
          }

          res.redirect('/profile');
        });
      }
    });
  });
};

exports.profile_update_api_key = (req, res) => {
  const {
    api_key
  } = req.body;
  const sessionUsername = req.session.username;

  db.query('SELECT account_type, edit_api_key_count FROM users WHERE username = ?', [sessionUsername], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type === 'Free') {
        return res.status(400).send(`<script>alert('Anda tidak diizinkan untuk mengubah API Key. Ini hanya tersedia untuk pengguna berbayar.'); window.location.href = '/plans';</script>`);
      }

      let maxEditCount;
      switch (user.account_type) {
        case 'Basic':
          maxEditCount = max_edit_api_key.basic;
          break;
        case 'Standard':
          maxEditCount = max_edit_api_key.standard;
          break;
        case 'Premium':
          maxEditCount = max_edit_api_key.premium;
          break;
        case 'Enterprise':
          maxEditCount = max_edit_api_key.enterprise;
          break;
        default:
          maxEditCount = max_edit_api_key.free;
      }

      if (user.edit_api_key_count >= maxEditCount) {
        return res.status(400).send(`<script>alert('Anda telah mencapai batas pengeditan untuk akun Anda.'); window.location.href = '/profile';</script>`);
      }

      db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Terjadi kesalahan pada server.');
        }

        if (results.length > 0) {
          return res.status(400).send(`<script>alert('API Key sudah digunakan.'); window.location.href = '/profile';</script>`);
        }

        const updatedData = {};
        if (api_key) updatedData.api_key = api_key;
        if (user.edit_api_key_count !== undefined) updatedData.edit_api_key_count = user.edit_api_key_count + 1; // Tingkatkan hitungan pengeditan

        db.query('UPDATE users SET ? WHERE username = ?', [updatedData, sessionUsername], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan pada server.');
          }

          res.redirect('/profile');
        });
      });
    } else {
      res.send(`<script>alert('User tidak ditemukan'); window.location.href = '/profile';</script>`);
    }
  });
};

exports.profile_delete_account = (req, res) => {
  const sessionUsername = req.session.username;

  db.query('DELETE FROM users WHERE username = ?', [sessionUsername], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    req.session.destroy();
    res.redirect('/');
  });
};

// API features area
exports.features_downloader = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-downloader', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_searcher = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-searcher', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_stalker = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-stalker', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_artificial_intelligence = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-artificial-intelligence', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_canvas = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-canvas', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_maker = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-maker', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_photooxy = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-photooxy', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_random_image = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-random-image', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_check_nickname = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-check-nickname', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_url_shortener = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-url-shortener', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_converter = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-converter', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_tools = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-tools', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

exports.features_all_features = (req, res) => {
  const username = req.session.username;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      res.render('features-all', {
        user
      });
    } else {
      res.send(`<p>No user found!</p>`);
    }
  });
};

// Count area
exports.total_visits_count = (req, res) => {
  db.query("SELECT SUM(visits) AS totalVisits FROM visitors", (err, countResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Gagal mengambil jumlah total kunjungan' });
    }

    const result = countResult[0].totalVisits || 0;
    return res.json({ count: result });
  });
};

exports.total_users_count = (req, res) => {
  db.query("SELECT COUNT(*) AS totalUser FROM users;", (err, countResult) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch user count' });
      return;
    }

    const result = countResult[0].totalUser || 0;
    res.json({ count: result });
  });
};

/*exports.total_daily_request_count = (req, res) => {
  const { api_key } = req.query;
  
  if (!api_key) {
    return res.json('Err');
  };
  
  const currentDate = new Date();
  const jakartaOffset = 7 * 60;
  const jakartaTime = new Date(currentDate.getTime() + jakartaOffset * 60000);
  const currentDateString = jakartaTime.toISOString().slice(0, 10);
  
  db.query('SELECT daily_requests FROM request_logs WHERE api_key = ? AND date = ?', [api_key, currentDateString], (err, todayResult) => {
     if (err) {
       console.error(err);
       return res.status(500).send('Terjadi kesalahan pada server.');
     }

     const result = todayResult.length > 0 ? todayResult[0].daily_requests : 0;

     res.json({ count: result });
  });
};

exports.total_request_count = (req, res) => {
  const { api_key } = req.query;
  
  if (!api_key) {
    return res.json('Err');
  };
  
  db.query('SELECT SUM(daily_requests) AS totalRequests FROM request_logs WHERE api_key = ?', [api_key], (err, totalResult) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    const result = totalResult.length > 0 ? totalResult[0].totalRequests : 0;

    res.json({ count: result });
  });
};*/

exports.total_daily_requests_count = (req, res) => {
  const currentDate = new Date();
  const jakartaOffset = +7 * 60;
  const jakartaTime = new Date(currentDate.getTime() + jakartaOffset * 60000);

  const currentDateString = jakartaTime.toISOString().slice(0, 10);

  db.query(
    "SELECT COUNT(*) AS totalDailyRequests FROM request_logs WHERE date = ?;",
    [currentDateString],
    (err, countResult) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch daily request count' });
        return;
      }

      const result = countResult[0].totalDailyRequests || 0;
      res.json({ count: result });
    }
  );
};

exports.total_requests_count = (req, res) => {
  db.query("SELECT COUNT(*) AS totalRequests FROM request_logs", (err, countResult) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch total request count' });
      return;
    }

    const result = countResult[0].totalRequests || 0;
    res.json({ count: result });
  });
};

// Help
exports.help = (req, res) => {
  fs.readFile(cwd + '/public/help' + '.html', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading HTML file');
    } else {
      res.status(200).send(data);
    }
  });
};

exports.documentation = (req, res) => {
  fs.readFile(cwd + '/public/documentation' + '.html', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading HTML file');
    } else {
      res.status(200).send(data);
    }
  });
};

exports.contact_support = (req, res) => {
  res.render('contact-support');
};