const express = require("express");
const db = require("./db");

const { createBookRepository } = require("./repositories/book");
const { createMemberRepository } = require("./repositories/member");
const { createLoanRepository } = require("./repositories/loan");

const { createLoanService } = require("./services/loan");

const { createLoanController } = require("./controllers/loan");

const app = express();

app.use(express.json());

// creo tutte le funzioni, inniettando le dipendenze necessarie
const bookRepository = createBookRepository(db);
const memberRepository = createMemberRepository(db);
const loanRepository = createLoanRepository(db);

const loanService = createLoanService({
  memberRepository,
  bookRepository,
  loanRepository,
  db,
});

const loanController = createLoanController({ loanService });

app.post("/loans", loanController);

app.get("/books/:id", (req, res) => {
  const bookId = Number(req.params.id);

  if (!Number.isSafeInteger(bookId) || bookId <= 0) {
    return res.status(400).json({
      error: "INVALID_BOOK_ID",
      message: "Book id must be a positive integer",
    });
  }

  const book = bookRepository.findById(bookId);

  if (!book) {
    return res.status(404).json({
      error: "BOOK_NOT_FOUND",
      message: "Book not found",
    });
  }

  return res.json(book);
});

module.exports = app;
