require('../config/appConfig');

const crypto = require('crypto');
const requestIp = require('request-ip');
const bcrypt = require('bcryptjs');

const {
  checkAuth,
  generateOTP,
  generateRandomByte
} = require('../utils/functions');
const cwd = require('../utils/current-working-directory');

const db = require('./mySQLController.js');

const {
  sendEmailOTP,
  sendResetPasswordEmail
} = require('./nodeMailerController');

// GET area
exports.get_login = (req, res) => {
  res.render('auth-login');
};

exports.get_signup = (req, res) => {
  res.render('auth-signup');
};

exports.get_logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

exports.get_verify_otp = (req, res) => {
  res.render('auth-verify-otp');
};

exports.get_forgot_password = (req, res) => {
  res.render('auth-forgot-password');
};

exports.get_recover_password = (req, res) => {
  const token = req.params.token;

  db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiration > NOW()', [token], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      res.render('auth-recover-password', {
        token
      });
    } else {
      res.send(`<script>alert('Token reset password tidak valid atau telah kedaluwarsa.'); window.location.href = '/auth/forgot-password';</script>`);
    }
  });
};

// POST area
exports.post_login = (req, res) => {
  const {
    identifier,
    password
  } = req.body;

  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [identifier, identifier], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      bcrypt.compare(password, user.password, (bcryptErr, passwordMatch) => {
        if (bcryptErr) {
          console.error('Gagal memeriksa password:', bcryptErr);
          return res.status(500).send('Terjadi kesalahan pada server.');
        }

        if (passwordMatch) {
          if (user.otp_verified) {
            req.session.username = user.username;
            return res.send(`<script>window.location.href = '/dashboard';</script>`);
          } else {
            return res.send(`<script>alert('OTP belum diverifikasi!'); window.location.href = '/auth/verify-otp';</script>`);
          }
        } else {
          return res.send(`<script>alert('Username/email atau password salah!'); window.location.href = '/auth/login';</script>`);
        }
      });
    } else {
      return res.send(`<script>alert('Username/email atau password salah!'); window.location.href = '/auth/login';</script>`);
    }
  });
};

/*exports.post_login = (req, res) => {
  const { identifier, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [identifier, identifier], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }

    if (result.length > 0) {
      const user = result[0];

      bcrypt.compare(password, user.password, (bcryptErr, passwordMatch) => {
        if (bcryptErr) {
          console.error('Gagal memeriksa password:', bcryptErr);
          return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
        }

        if (passwordMatch) {
          if (user.otp_verified) {
            req.session.username = user.username;
            return res.redirect('/dashboard');
          } else {
            return res.status(400).json({ error: 'OTP belum diverifikasi!' });
          }
        } else {
          return res.status(400).json({ error: 'Username/email atau password salah!' });
        }
      });
    } else {
      return res.status(400).json({ error: 'Username/email atau password salah!' });
    }
  });
};*/

/*exports.post_signup = (req, res) => {
  const {
    email,
    username,
    password
  } = req.body;

  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      return res.send(`<script>alert('Username atau email sudah terdaftar!'); window.location.href = '/auth/signup';</script>`);
    } else {
      const apiKey = 'sk-' + generateRandomByte(17);
      const otp = generateOTP();

      sendEmailOTP(email, otp, (err) => {
        if (err) {
          console.error('Gagal mengirim email OTP:', err);
          return res.send(`<script>alert('Registrasi gagal!'); window.location.href = '/auth/signup';</script>`);
        } else {
          db.query('INSERT INTO users (email, username, password, api_key, usage_limit, otp) VALUES (?, ?, ?, ?, ?, ?)', [email, username, password, apiKey, usage_limit_amount.free, otp], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Terjadi kesalahan pada server.');
            }
            return res.send(`<script>alert('Registrasi berhasil! Silakan periksa email Anda untuk OTP.'); window.location.href = '/auth/verify-otp';</script>`);
          });
        }
      });
    }
  });
};*/

exports.post_signup = (req, res) => {
  const clientIP = requestIp.getClientIp(req);

  const {
    email,
    username,
    password
  } = req.body;

  db.query('SELECT * FROM ip_tracking WHERE ip_address = ?', [clientIP], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (rows.length > 0 && rows[0].sign_up_count >= max_sign_up) {
      return res.status(403).send(`<script>alert('IP blocked due to excessive sign-up attempts.');</script> IP blocked due to excessive sign-up attempts.`);
    }

    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Terjadi kesalahan pada server.');
      }

      if (result.length > 0) {
        return res.send(`<script>alert('Username atau email sudah terdaftar!'); window.location.href = '/auth/signup';</script>`);
      } else {
        const apiKey = 'sk-' + generateRandomByte(17);
        const otp = generateOTP();

        sendEmailOTP(email, otp, (err) => {
          if (err) {
            console.error('Gagal mengirim email OTP:', err);
            return res.send(`<script>alert('Registrasi gagal!'); window.location.href = '/auth/signup';</script>`);
          } else {
            db.query('INSERT INTO users (email, username, password, api_key, usage_limit, otp) VALUES (?, ?, ?, ?, ?, ?)', [email, username, password, apiKey, usage_limit_amount.free, otp], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).send('Terjadi kesalahan pada server.');
              }

              const saltRounds = 10;
              bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                if (err) {
                  console.error('Gagal menghash password:', err);
                  return res.status(500).send('Terjadi kesalahan pada server.');
                }

                db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (err) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).send('Terjadi kesalahan pada server.');
                  }

                  db.query('INSERT INTO ip_tracking (ip_address, sign_up_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE sign_up_count = sign_up_count + 1', [clientIP], (err) => {
                    if (err) {
                      console.error(err);
                    }

                    return res.send(`<script>alert('Registrasi berhasil! Silakan periksa email Anda untuk OTP.'); window.location.href = '/auth/verify-otp';</script>`);
                  });
                });
              });
            });
          }
        });
      }
    });
  });
};

exports.post_verify_otp = (req, res) => {
  const {
    otp
  } = req.body;

  db.query('SELECT * FROM users WHERE otp = ?', [otp], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('UPDATE users SET otp_verified = true WHERE otp = ?', [otp], (err) => {
        if (err) {
          console.error('Gagal memperbarui status verifikasi OTP:', err);
          return res.send(`<script>alert('Verifikasi OTP gagal!')</script>`);
        }

        req.session.username = user.username;

        return res.redirect('/dashboard');
      });
    } else {
      res.send(`<script>alert('OTP salah!'); window.location.href = '/auth/verify-otp';</script>`);
    }
  });
};

exports.post_forgot_password = (req, res) => {
  const email = req.body.email;
  const protocol = req.protocol;
  const hostname = req.hostname;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];
      const token = crypto.randomBytes(20).toString('hex');

      sendResetPasswordEmail(email, token, protocol, hostname, (err) => {
        if (err) {
          console.error('Failed to send reset password email:', err);
          res.send(`<script>alert('Failed to send reset password email.'); window.location.href = '/auth/forgot-password';</script>`);
        } else {
          res.send(`<script>alert('Email with reset password link has been sent.'); window.location.href = '/auth/forgot-password';</script>`);
        }
      });
    } else {
      res.send(`<script>alert('Email is not registered.'); window.location.href = '/auth/forgot-password';</script>`);
    }
  });
};

exports.post_recover_password = (req, res) => {
  const token = req.params.token;
  const newPassword = req.body.password;

  db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiration > NOW()', [token], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (result.length > 0) {
      const user = result[0];

      const saltRounds = 10;
      bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
        if (err) {
          console.error('Gagal menghash password baru:', err);
          return res.status(500).send('Terjadi kesalahan pada server.');
        }

        db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?', [hashedPassword, user.id], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan pada server.');
          }

          console.log('Kata sandi berhasil direset.');
          res.send(`<script>alert('Kata sandi Anda telah direset. Silakan login dengan kata sandi baru.'); window.location.href = '/auth/login';</script>`);
        });
      });
    } else {
      res.send(`<script>alert('Token reset password tidak valid atau telah kedaluwarsa.'); window.location.href = '/auth/forgot-password';</script>`);
    }
  });
};