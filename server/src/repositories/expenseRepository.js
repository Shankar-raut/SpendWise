import { parseAmount } from '../utils/validation.js';

function toExpense(row) {
  return {
    id: row.id,
    title: row.title,
    amount: parseAmount(row.amount),
    category: row.category,
    date: row.spent_on,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function createExpenseRepository(db) {
  return {
    list(filters = {}) {
      const clauses = [];
      const params = {};

      if (filters.search) {
        clauses.push('(title LIKE @search OR notes LIKE @search OR category LIKE @search)');
        params.search = `%${filters.search}%`;
      }

      if (filters.category) {
        clauses.push('category = @category');
        params.category = filters.category;
      }

      if (filters.from) {
        clauses.push('spent_on >= @from');
        params.from = filters.from;
      }

      if (filters.to) {
        clauses.push('spent_on <= @to');
        params.to = filters.to;
      }

      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      return db
        .prepare(`SELECT * FROM expenses ${where} ORDER BY spent_on DESC, id DESC`)
        .all(params)
        .map(toExpense);
    },

    categories() {
      return db
        .prepare('SELECT DISTINCT category FROM expenses ORDER BY category COLLATE NOCASE')
        .all()
        .map((row) => row.category);
    },

    create(expense) {
      const result = db
        .prepare(
          `INSERT INTO expenses (title, amount, category, spent_on, notes)
           VALUES (@title, @amount, @category, @date, @notes)`
        )
        .run(expense);
      return this.find(result.lastInsertRowid);
    },

    update(id, expense) {
      db.prepare(
        `UPDATE expenses
         SET title = @title,
             amount = @amount,
             category = @category,
             spent_on = @date,
             notes = @notes,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = @id`
      ).run({ id, ...expense });
      return this.find(id);
    },

    delete(id) {
      return db.prepare('DELETE FROM expenses WHERE id = ?').run(id).changes > 0;
    },

    find(id) {
      const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
      return row ? toExpense(row) : null;
    },

    totals() {
      const today = new Date();
      const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      const row = db
        .prepare(
          `SELECT
            COALESCE(SUM(amount), 0) AS total,
            COALESCE(SUM(CASE WHEN spent_on >= ? THEN amount ELSE 0 END), 0) AS monthly
           FROM expenses`
        )
        .get(monthStart);

      return {
        totalSpending: parseAmount(row.total),
        monthlySpending: parseAmount(row.monthly)
      };
    }
  };
}
