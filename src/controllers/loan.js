function createLoanController({ loanService }) {
  return function loanController(req, res) {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        error: "INVALID_BODY",
        message: "Body must be a JSON object",
      });
    }

    const memberId = body.memberId;
    const bookId = body.bookId;

    if (!Number.isSafeInteger(memberId) || memberId <= 0) {
      return res.status(400).json({
        error: "INVALID_MEMBER_ID",
        message: "memberId must be a positive integer",
      });
    }

    if (!Number.isSafeInteger(bookId) || bookId <= 0) {
      return res.status(400).json({
        error: "INVALID_BOOK_ID",
        message: "bookId must be a positive integer",
      });
    }

    const loan = loanService.create({ memberId, bookId });

    return res.status(loan.status).json(loan.body);
  };
}

module.exports = { createLoanController };
