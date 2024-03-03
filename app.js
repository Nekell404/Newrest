require('./config/appConfig');
const {
  checkAuth,
  formatDateToString
} = require('./utils/functions');
const cwd = require('./utils/current-working-directory');

const packageInfo = require('./package.json');

const express = require('express');
const ejs = require('ejs');
const cron = require('node-cron');
const bodyParser = require('body-parser');
const secure = require('ssl-express-www');
const cors = require('cors');
const expressSession = require('express-session');
const path = require('path');
const morgan = require('morgan');

const db = require('./controllers/mySQLController');

// Cron schedule area
cron.schedule(cron_schedule.usage_limit, () => {
  db.query('UPDATE users SET usage_limit = ' + usage_limit_amount.free + ' WHERE account_type = "Free"', (err) => {
    if (err) {
      console.error(err);
    }
    console.log('</> Free user limits have been reset');
  });
  db.query('UPDATE users SET usage_limit = ' + usage_limit_amount.basic + ' WHERE account_type = "Basic"', (err) => {
    if (err) {
      console.error(err);
    }
    console.log('</> Basic user limits have been reset');
  });
  db.query('UPDATE users SET usage_limit = ' + usage_limit_amount.standard + ' WHERE account_type = "Standard"', (err) => {
    if (err) {
      console.error(err);
    }
    console.log('</> Standar user limits have been reset');
  });
}, {
  timezone: cron_schedule.timezone
});

cron.schedule(cron_schedule.daily_requests, () => {
  const currentDate = new Date();
  const jakartaOffset = +7 * 60;
  const jakartaTime = new Date(currentDate.getTime() + jakartaOffset * 60000);

  const dateStr = jakartaTime.toISOString().split('T')[0];

  db.query('UPDATE request_logs SET daily_requests = 0 WHERE date = ?', [dateStr], (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('</> Daily requests count has been reset');
    }
  });
}, {
  timezone: cron_schedule.timezone
});

// Handle errors gracefully
process.on('uncaughtException', (err) => {
  console.error('An uncaught error occurred:', err);
});

try {
  const currentDate = new Date();

  db.query('SELECT * FROM users WHERE DATE(expired_date) = DATE(?) AND account_type != ?', [currentDate, 'Free'], (err, users) => {
    if (err) {
      console.error('Error querying users:', err);
      return;
    }

    users.forEach(user => {
      db.query(
        'UPDATE users SET account_type = ?, usage_limit = ? WHERE id = ?',
        ['Free', usage_limit_amount.free, user.id],
        (err) => {
          if (err) {
            console.error('Error updating user plan:', err);
          } else {
            console.log(`User ${user.username} has been reset to Free with a usage limit of 100.`);
          }
        }
      );
    });
  });
} catch (err) {
  console.error(err);
}

//const mainRoutes = require('./routes/mainRoutes');
const pagesRoutes = require('./routes/pagesRoutes');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const checkCredentialsRoutes = require('./routes/checkCredentialsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ordersRoutes = require('./routes/ordersRoutes');

const app = express();

app.locals.serverStartTime = new Date();

app.use(bodyParser.urlencoded({
  extended: body_parser_urlencoded_extended
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public'));
app.set('json spaces', json_spaces);
app.use(secure);
app.use(cors());
app.use(morgan('dev'));

app.use(expressSession({
  secret: session.secret,
  resave: session.resave,
  saveUninitialized: session.save_uninitialized,
  cookie: {
    maxAge: session.cookie.max_age
  }
}));

//app.use('/', mainRoutes);
app.use('/', pagesRoutes);
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/check-credentials', checkCredentialsRoutes);
app.use('/admin', adminRoutes);
app.use('/orders', ordersRoutes);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '/public/pages-404.html'));
});

const projectInfo = {
  version: packageInfo.version,
  creator: packageInfo.author.name,
  creationDate: packageInfo.creation_date,
  updateDate: packageInfo.update_date
};

console.log(`Project Information:
• Developer: ${projectInfo.creator}
• Version: ${projectInfo.version}
• Programming Language: JavaScript
• Type: CommonJS
• Runtime Environment: NodeJS
• Libraries or Frameworks: ExpressJS
• Creation Date: ${projectInfo.creationDate}
• Update Date: ${projectInfo.updateDate}\n`);

async function startServer() {
  try {
    await app.listen(port);
    console.log('</> Server is running on port', port);
  } catch (error) {
    console.error('An error occurred while trying to start the server:', error);
  }
}

startServer();