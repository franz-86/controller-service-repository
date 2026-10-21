DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS members;

CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  active INTEGER NOT NULL CHECK (active IN (0, 1))
);

CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  availableCopies INTEGER NOT NULL CHECK (availableCopies >= 0)
);

CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  memberId INTEGER NOT NULL REFERENCES members(id),
  bookId INTEGER NOT NULL REFERENCES books(id),
  loanDate TEXT NOT NULL,
  dueDate TEXT NOT NULL,
  returnedAt TEXT
);
