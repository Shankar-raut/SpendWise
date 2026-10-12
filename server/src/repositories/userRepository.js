export function createUserRepository(db) {
  return {
    findByEmail(email) {
      const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
      return row ? toUser(row) : null;
    },

    find(id) {
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      return row ? toUser(row) : null;
    },

    create(user) {
      const result = db
        .prepare('INSERT INTO users (name, email, password_hash) VALUES (@name, @email, @passwordHash)')
        .run({ ...user, email: user.email.toLowerCase() });
      return this.find(result.lastInsertRowid);
    }
  };
}

function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at
  };
}
