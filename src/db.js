const path = require('node:path');
const Database = require('better-sqlite3');

const databasePath = process.env.DB_PATH || path.join(__dirname, '../database/library.sqlite');
const db = new Database(databasePath);

db.pragma('foreign_keys = ON');

module.exports = db;
