const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

let db;
let server;
let baseUrl;

const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
const seed = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');

function resetDatabase() {
  const reset = db.transaction(() => {
    db.exec(schema);
    db.exec(seed);
  });
  reset();
}

async function postLoan(body) {
  return fetch(`${baseUrl}/loans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

before(async () => {
  const previousDatabasePath = process.env.DB_PATH;
  process.env.DB_PATH = ':memory:';
  db = require('../src/db');
  const app = require('../src/app');

  if (previousDatabasePath === undefined) {
    delete process.env.DB_PATH;
  } else {
    process.env.DB_PATH = previousDatabasePath;
  }

  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    server.on('error', reject);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server && server.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  if (db) {
    db.close();
  }
});

test('POST /loans crea un prestito valido', async () => {
  resetDatabase();

  const response = await postLoan({ memberId: 1, bookId: 2 });
  const loan = await response.json();

  assert.equal(response.status, 201);
  assert.ok(Number.isSafeInteger(loan.id));
  assert.equal(loan.memberId, 1);
  assert.equal(loan.bookId, 2);
  assert.equal(loan.returnedAt, null);
});

test('POST /loans rifiuta un socio inattivo', async () => {
  resetDatabase();

  const response = await postLoan({ memberId: 3, bookId: 2 });
  const error = await response.json();

  assert.equal(response.status, 403);
  assert.equal(error.error, 'MEMBER_INACTIVE');
});

test('GET /books/:id restituisce un libro esistente', async () => {
  resetDatabase();

  const response = await fetch(`${baseUrl}/books/2`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    id: 2,
    title: 'Programmare con JavaScript',
    availableCopies: 2
  });
});
