/*const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_mysql_username',
  password: 'your_mysql_password',
  database: 'your_database_name'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL database');
});

class Item {
  static getAll(callback) {
    const query = 'SELECT * FROM items';
    connection.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM items WHERE id = ?';
    connection.query(query, [id], callback);
  }

  static create(newItem, callback) {
    const query = 'INSERT INTO items SET ?';
    connection.query(query, newItem, callback);
  }

  static update(id, updatedItem, callback) {
    const query = 'UPDATE items SET ? WHERE id = ?';
    connection.query(query, [updatedItem, id], callback);
  }

  static delete(id, callback) {
    const query = 'DELETE FROM items WHERE id = ?';
    connection.query(query, [id], callback);
  }
}

module.exports = Item;*/