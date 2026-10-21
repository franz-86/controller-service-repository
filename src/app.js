const express = require('express');
const db = require('./db');

const app = express();

app.use(express.json());

app.post('/loans', (req, res) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      error: 'INVALID_BODY',
      message: 'Body must be a JSON object'
    });
  }

  const memberId = body.memberId;
  const bookId = body.bookId;

  if (!Number.isSafeInteger(memberId) || memberId <= 0) {
    return res.status(400).json({
      error: 'INVALID_MEMBER_ID',
      message: 'memberId must be a positive integer'
    });
  }

  if (!Number.isSafeInteger(bookId) || bookId <= 0) {
    return res.status(400).json({
      error: 'INVALID_BOOK_ID',
      message: 'bookId must be a positive integer'
    });
  }

  const createLoan = db.transaction(() => {
    const member = db.prepare('SELECT id, name, active FROM members WHERE id = ?').get(memberId);

    if (!member) {
      return {
        status: 404,
        body: { error: 'MEMBER_NOT_FOUND', message: 'Member not found' }
      };
    }

    if (member.active === 0) {
      return {
        status: 403,
        body: { error: 'MEMBER_INACTIVE', message: 'Member is inactive' }
      };
    }

    const book = db.prepare('SELECT id, title, availableCopies FROM books WHERE id = ?').get(bookId);

    if (!book) {
      return {
        status: 404,
        body: { error: 'BOOK_NOT_FOUND', message: 'Book not found' }
      };
    }

    if (book.availableCopies <= 0) {
      return {
        status: 409,
        body: { error: 'NO_AVAILABLE_COPIES', message: 'No copies available' }
      };
    }

    const activeLoans = db.prepare(`
      SELECT COUNT(*) AS count
      FROM loans
      WHERE memberId = ? AND returnedAt IS NULL
    `).get(memberId);

    if (activeLoans.count >= 3) {
      return {
        status: 409,
        body: { error: 'LOAN_LIMIT_REACHED', message: 'Member already has 3 active loans' }
      };
    }

    const now = new Date();
    const due = new Date(now);
    due.setUTCDate(due.getUTCDate() + 14);

    const loanDate = now.toISOString();
    const dueDate = due.toISOString();

    const result = db.prepare(`
      INSERT INTO loans (memberId, bookId, loanDate, dueDate, returnedAt)
      VALUES (?, ?, ?, ?, NULL)
    `).run(memberId, bookId, loanDate, dueDate);

    db.prepare(`
      UPDATE books
      SET availableCopies = availableCopies - 1
      WHERE id = ?
    `).run(bookId);

    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(result.lastInsertRowid);

    return { status: 201, body: loan };
  });

  try {
    // Il lock di scrittura precede anche i controlli sulle copie e sui prestiti attivi.
    const result = createLoan.immediate();
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    });
  }
});

app.get('/books/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'INVALID_BOOK_ID',
      message: 'Book id must be a positive integer'
    });
  }

  const book = db.prepare('SELECT id, title, availableCopies FROM books WHERE id = ?').get(id);

  if (!book) {
    return res.status(404).json({
      error: 'BOOK_NOT_FOUND',
      message: 'Book not found'
    });
  }

  return res.json(book);
});

module.exports = app;
