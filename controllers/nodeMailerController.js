require('../config/appConfig');

const nodemailer = require('nodemailer');

const db = require('./mySQLController');

function sendEmailOTP(email, otp, callback) {
  const transporter = nodemailer.createTransport({
    host: email_smtp.host,
    port: email_smtp.port,
    secure: email_smtp.secure,
    auth: {
      user: email_smtp.auth.user,
      pass: email_smtp.auth.pass
    }
  });

  const mailOptions = {
    from: email_smtp.auth.user,
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP is ${otp}`
  };

  transporter.sendMail(mailOptions, callback);
}

function sendResetPasswordEmail(email, token, protocol, hostname, callback) {
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error(err);
    }

    if (result.length > 0) {
      const user = result[0];
      const expirationDate = new Date(Date.now() + (60 * 60 * 1000)); // Expiration time: 1 hour from now

      db.query('UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE id = ?', [token, expirationDate, user.id], (err) => {
        if (err) {
          console.error(err);
        }
        console.log('Reset password token and expiration time saved to the database.');

        const transporter = nodemailer.createTransport({
          host: email_smtp.host,
          port: email_smtp.port,
          secure: email_smtp.secure,
          auth: {
            user: email_smtp.auth.user,
            pass: email_smtp.auth.pass
          }
        });

        const mailOptions = {
          from: email_smtp.auth.user,
          to: email,
          subject: 'Reset Password',
          html: `
          <p>Hello ${user.username},</p>
          <p>We have received a request to reset your account password. If you did not make this request, please ignore this email. If you wish to reset your password, please click the link below:</p>
          <a href="${protocol}://${hostname}/auth/recover-password/${token}">Recover Password</a>
          <p>This link will expire in 1 hour.</p>
          `
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error(err);
          }
          console.log('Reset password email sent:', info.response);
          callback(null);
        });
      });
    } else {
      callback('Email is not registered.');
    }
  });
}

function sendBroadcastEmails(emails, subject, message, callback) {
  const transporter = nodemailer.createTransport({
    host: email_smtp.host,
    port: email_smtp.port,
    secure: email_smtp.secure,
    auth: {
      user: email_smtp.auth.user,
      pass: email_smtp.auth.pass
    }
  });

  const mailOptions = {
    from: email_smtp.auth.user,
    to: emails.join(','),
    subject: subject,
    text: message
  };

  transporter.sendMail(mailOptions, callback);
}

module.exports = {
  sendEmailOTP,
  sendResetPasswordEmail,
  sendBroadcastEmails
};