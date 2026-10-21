const fs = require('node:fs');
const path = require('node:path');
const db = require('../src/db');

try {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

  const initialize = db.transaction(() => {
    db.exec(schema);
    db.exec(seed);
  });

  initialize();
  console.log('Database inizializzato con i dati di esempio.');
} finally {
  db.close();
}
