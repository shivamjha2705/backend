// src/config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, // Use environment variables for security
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3100
});

module.exports = pool;
