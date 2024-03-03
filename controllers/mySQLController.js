require('../config/appConfig');

const mysql = require('mysql');
const os = require('os');
const platform = os.platform();
const shell = require('shelljs');

const db = mysql.createConnection({
  host: connection.host,
  user: connection.user,
  password: connection.password,
  database: connection.database
});

async function connectToDatabase() {
  await db.connect((err) => {
    if (err) {
      console.error(err);
      setTimeout(connectToDatabase, 60000);
    } else {
      console.log('</> Successfully connected to MySql database');
      if (auto_open_browser) {
        console.log('Opening browser...');
        if (platform === 'win32') {
          shell.exec('start "" http://localhost:', port);
        } else if (platform === 'linux') {
          shell.exec('xdg-open http://localhost:', port);
        } else if (platform === 'darwin') {
          shell.exec('open http://localhost:', port);
        } else if (platform === 'android') {
          shell.exec('am start -a android.intent.action.VIEW -d http://localhost:', port);
        } else {
          console.log('Platform not supported for auto browser open.');
        }
      }
    }
  });
}

connectToDatabase();

module.exports = db;