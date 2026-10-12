import { parseAmount } from '../utils/validation.js';

function toDebt(row) {
  const repaid = row.repaid || 0;
  return {
    id: row.id,
    friendId: row.friend_id,
    friendName: row.friend_name,
    title: row.title,
    amount: parseAmount(row.amount),
    repaid: parseAmount(repaid),
    outstanding: parseAmount(Math.max(row.amount - repaid, 0)),
    direction: row.direction,
    date: row.debt_date,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function createDebtRepository(db) {
  return {
    list() {
      return db
        .prepare(
          `SELECT d.*, f.name AS friend_name, COALESCE(r.repaid, 0) AS repaid
           FROM debts d
           JOIN friends f ON f.id = d.friend_id
           LEFT JOIN (
             SELECT debt_id, SUM(amount) AS repaid
             FROM repayments
             GROUP BY debt_id
           ) r ON r.debt_id = d.id
           ORDER BY d.debt_date DESC, d.id DESC`
        )
        .all()
        .map(toDebt);
    },

    create(debt) {
      const result = db
        .prepare(
          `INSERT INTO debts (friend_id, title, amount, direction, debt_date, notes)
           VALUES (@friendId, @title, @amount, @direction, @date, @notes)`
        )
        .run(debt);
      return this.find(result.lastInsertRowid);
    },

    update(id, debt) {
      db.prepare(
        `UPDATE debts
         SET friend_id = @friendId,
             title = @title,
             amount = @amount,
             direction = @direction,
             debt_date = @date,
             notes = @notes,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = @id`
      ).run({ id, ...debt });
      return this.find(id);
    },

    delete(id) {
      return db.prepare('DELETE FROM debts WHERE id = ?').run(id).changes > 0;
    },

    find(id) {
      const row = db
        .prepare(
          `SELECT d.*, f.name AS friend_name, COALESCE(r.repaid, 0) AS repaid
           FROM debts d
           JOIN friends f ON f.id = d.friend_id
           LEFT JOIN (
             SELECT debt_id, SUM(amount) AS repaid
             FROM repayments
             GROUP BY debt_id
           ) r ON r.debt_id = d.id
           WHERE d.id = ?`
        )
        .get(id);
      return row ? toDebt(row) : null;
    },

    addRepayment(repayment) {
      const result = db
        .prepare(
          `INSERT INTO repayments (debt_id, amount, paid_on, notes)
           VALUES (@debtId, @amount, @date, @notes)`
        )
        .run(repayment);
      return db.prepare('SELECT * FROM repayments WHERE id = ?').get(result.lastInsertRowid);
    },

    repayments(debtId) {
      return db
        .prepare('SELECT * FROM repayments WHERE debt_id = ? ORDER BY paid_on DESC, id DESC')
        .all(debtId)
        .map((row) => ({
          id: row.id,
          debtId: row.debt_id,
          amount: parseAmount(row.amount),
          date: row.paid_on,
          notes: row.notes || '',
          createdAt: row.created_at
        }));
    },

    deleteRepayment(id) {
      return db.prepare('DELETE FROM repayments WHERE id = ?').run(id).changes > 0;
    },

    totals() {
      const row = db
        .prepare(
          `SELECT
            COALESCE(SUM(CASE
              WHEN d.direction = 'i_owe' THEN d.amount - COALESCE(r.repaid, 0)
              ELSE 0
            END), 0) AS i_owe,
            COALESCE(SUM(CASE
              WHEN d.direction = 'owes_me' THEN d.amount - COALESCE(r.repaid, 0)
              ELSE 0
            END), 0) AS owes_me
           FROM debts d
           LEFT JOIN (
             SELECT debt_id, SUM(amount) AS repaid
             FROM repayments
             GROUP BY debt_id
           ) r ON r.debt_id = d.id`
        )
        .get();

      return {
        moneyIOwe: parseAmount(row.i_owe),
        moneyOwedToMe: parseAmount(row.owes_me)
      };
    }
  };
}
