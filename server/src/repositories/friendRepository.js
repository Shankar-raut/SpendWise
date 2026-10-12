export function createFriendRepository(db) {
  return {
    list() {
      return db
        .prepare(
          `SELECT f.*,
            COALESCE(SUM(CASE
              WHEN d.direction = 'i_owe' THEN d.amount - COALESCE(r.repaid, 0)
              ELSE 0
            END), 0) AS i_owe,
            COALESCE(SUM(CASE
              WHEN d.direction = 'owes_me' THEN d.amount - COALESCE(r.repaid, 0)
              ELSE 0
            END), 0) AS owes_me
           FROM friends f
           LEFT JOIN debts d ON d.friend_id = f.id
           LEFT JOIN (
             SELECT debt_id, SUM(amount) AS repaid
             FROM repayments
             GROUP BY debt_id
           ) r ON r.debt_id = d.id
           GROUP BY f.id
           ORDER BY f.name COLLATE NOCASE`
        )
        .all()
        .map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email || '',
          balance: (row.owes_me - row.i_owe) / 100,
          createdAt: row.created_at
        }));
    },

    create(friend) {
      const result = db
        .prepare('INSERT INTO friends (name, email) VALUES (@name, @email)')
        .run(friend);
      return this.find(result.lastInsertRowid);
    },

    delete(id) {
      return db.prepare('DELETE FROM friends WHERE id = ?').run(id).changes > 0;
    },

    find(id) {
      const row = db.prepare('SELECT * FROM friends WHERE id = ?').get(id);
      return row
        ? { id: row.id, name: row.name, email: row.email || '', createdAt: row.created_at }
        : null;
    }
  };
}
