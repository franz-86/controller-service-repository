INSERT INTO members (id, name, active) VALUES
  (1, 'Alice Rossi', 1),
  (2, 'Marco Bianchi', 1),
  (3, 'Sara Verdi', 0),
  (4, 'Luca Neri', 1);

-- Le copie disponibili escludono quelle dei prestiti ancora attivi.
INSERT INTO books (id, title, availableCopies) VALUES
  (1, 'Architettura del software', 3),
  (2, 'Programmare con JavaScript', 2),
  (3, 'Algoritmi e strutture dati', 0),
  (4, 'Reti di calcolatori', 1);

INSERT INTO loans (id, memberId, bookId, loanDate, dueDate, returnedAt) VALUES
  (1, 2, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+14 days'), NULL),
  (2, 4, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+14 days'), NULL),
  (3, 4, 2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+14 days'), NULL),
  (4, 4, 3, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+14 days'), NULL),
  (5, 1, 4, '2026-01-01T10:00:00.000Z', '2026-01-15T10:00:00.000Z', '2026-01-10T10:00:00.000Z');
