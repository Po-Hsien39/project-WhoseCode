const mysql = require('mysql2/promise');
const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;
require('dotenv-defaults').config();

const mysqlEnv = {
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
};

mysqlEnv.waitForConnections = true;
mysqlEnv.connectionLimit = 20;

const pool = mysql.createPool(mysqlEnv);

module.exports = pool;
