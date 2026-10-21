function createLoanRepository(db) {
  const countMemberLoansStmt = db.prepare(`
      SELECT COUNT(*) AS count
      FROM loans
      WHERE memberId = ? AND returnedAt IS NULL
    `);

  const createLoanStmt = db.prepare(`
      INSERT INTO loans (memberId, bookId, loanDate, dueDate, returnedAt)
      VALUES (?, ?, ?, ?, NULL)
    `);

  const findLoanByIdStmt = db.prepare("SELECT * FROM loans WHERE id = ?");

  function countMemberLoans(memberId) {
    //restituisce direttamente il valore del contatore
    return countMemberLoansStmt.get(memberId).count;
  }

  function create({ memberId, bookId, loanDate, dueDate }) {
    return createLoanStmt.run(memberId, bookId, loanDate, dueDate);
  }

  function findById(id) {
    return findLoanByIdStmt.get(id);
  }

  return { countMemberLoans, create, findById };
}

module.exports = { createLoanRepository };
