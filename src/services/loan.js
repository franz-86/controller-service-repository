function createLoanService({
  memberRepository,
  bookRepository,
  loanRepository,
  db,
}) {
  function createLoanTnx({ memberId, bookId }) {
    const member = memberRepository.findById(memberId);

    if (!member) {
      return {
        status: 404,
        body: { error: "MEMBER_NOT_FOUND", message: "Member not found" },
      };
    }

    if (member.active === 0) {
      return {
        status: 403,
        body: { error: "MEMBER_INACTIVE", message: "Member is inactive" },
      };
    }

    const book = bookRepository.findById(bookId);

    if (!book) {
      return {
        status: 404,
        body: { error: "BOOK_NOT_FOUND", message: "Book not found" },
      };
    }

    if (book.availableCopies <= 0) {
      return {
        status: 409,
        body: {
          error: "NO_AVAILABLE_COPIES",
          message: "No copies available",
        },
      };
    }

    const activeLoans = loanRepository.countMemberLoans(memberId);

    if (activeLoans >= 3) {
      return {
        status: 409,
        body: {
          error: "LOAN_LIMIT_REACHED",
          message: "Member already has 3 active loans",
        },
      };
    }

    const now = new Date();
    const due = new Date(now);
    due.setUTCDate(due.getUTCDate() + 14);

    const loanDate = now.toISOString();
    const dueDate = due.toISOString();

    const result = loanRepository.create({
      memberId,
      bookId,
      loanDate,
      dueDate,
    });

    bookRepository.decreaseBookCopies(bookId);

    const loan = loanRepository.findById(result.lastInsertRowid);

    return { status: 201, body: loan };
  }

  function create({ memberId, bookId }) {
    const createLoan = db.transaction(() =>
      createLoanTnx({ memberId, bookId }),
    );

    try {
      // Il lock di scrittura precede anche i controlli sulle copie e sui prestiti attivi.
      const result = createLoan.immediate();
      return result;
    } catch (error) {
      console.error(error);
      return {
        status: 500,
        body: {
          error: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      };
    }
  }

  return { create };
}

module.exports = { createLoanService };
