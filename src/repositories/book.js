function createBookRepository(db) {
  const bookFindByIdStmt = db.prepare(
    "SELECT id, title, availableCopies FROM books WHERE id = ?",
  );

  const decreaseBookCopiesStmt = db.prepare(
    `
      UPDATE books
      SET availableCopies = availableCopies - 1
      WHERE id = ?
    `,
  );

  function findById(id) {
    return bookFindByIdStmt.get(id);
  }

  function decreaseBookCopies(id) {
    decreaseBookCopiesStmt.run(id);
  }

  return { findById, decreaseBookCopies };
}

module.exports = { createBookRepository };
