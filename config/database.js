const mysql = require('mysql2');

let db;

function handleDisconnect() {
  db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // default XAMPP has no password
    database: 'pauinv',
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  });

  db.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err);
      setTimeout(handleDisconnect, 2000); // Retry after 2 seconds
      return;
    }
    console.log('Connected to MySQL database');
  });

  db.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // Reconnect if connection is lost
    } else {
      throw err;
    }
  });
}

// Initialize connection
handleDisconnect();

module.exports = db;
