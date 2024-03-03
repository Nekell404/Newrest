require('../config/appConfig');

const db = require('./mySQLController.js');

exports.username = (req, res) => {
  const {
    username
  } = req.params;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      throw err;
    }

    if (result.length > 0) {
      res.json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          username: username,
          registered: "Yes"
        }
      });
    } else {
      res.json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          username: username,
          registered: "No"
        }
      });
    }
  });
};

exports.email = (req, res) => {
  const {
    email
  } = req.params;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      throw err;
    }

    if (result.length > 0) {
      res.json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          email: email,
          registered: "Yes"
        }
      });
    } else {
      res.json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          email: email,
          registered: "No"
        }
      });
    }
  });
};

exports.api_key = (req, res) => {
  const {
    api_key
  } = req.params;

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      throw err;
    }

    if (result.length > 0) {
      res.json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          api_key: api_key,
          registered: "Yes"
        }
      });
    } else {
      res.json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          api_key: api_key,
          registered: "No"
        }
      });
    }
  });
};

exports.usage_limit = (req, res) => {
  const {
    api_key
  } = req.params;

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      throw err;
    }

    if (result.length > 0) {
      let usage_limit = null;

      if (result[0].account_type === "Premium" || result[0].account_type === "Enterprise") {
        usage_limit = "Unlimited";
      } else {
        usage_limit = result[0].usage_limit;
      }

      res.json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          api_key: api_key,
          usage_limit: usage_limit,
          registered: "Yes"
        }
      });
    } else {
      res.json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          api_key: api_key,
          usage_limit: null,
          registered: "No"
        }
      });
    }
  });
};