function createMemberRepository(db) {
  const memberFindByIdStmt = db.prepare(
    "SELECT id, name, active FROM members WHERE id = ?",
  );

  function findById(id) {
    return memberFindByIdStmt.get(id);
  }

  return { findById };
}

module.exports = { createMemberRepository };
