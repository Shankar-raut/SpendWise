import { getDb } from '../src/db/client.js';
import { runMigrations } from '../src/db/migrate.js';
import { hashPassword } from '../src/utils/auth.js';

const db = getDb();
runMigrations(db);

const expenseCount = db.prepare('SELECT COUNT(*) AS count FROM expenses').get().count;
const friendCount = db.prepare('SELECT COUNT(*) AS count FROM friends').get().count;

const user = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@spendwise.local');
if (!user) {
  db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(
    'Demo User',
    'demo@spendwise.local',
    hashPassword('password123')
  );
  console.log('Development login created: demo@spendwise.local / password123');
}

if (expenseCount > 0 || friendCount > 0) {
  console.log('Seed skipped: database already contains data.');
  process.exit(0);
}

const friends = [
  { name: 'Aarav Mehta', email: 'aarav@example.com' },
  { name: 'Nisha Rao', email: 'nisha@example.com' },
  { name: 'Kabir Sen', email: '' }
];

const insertFriend = db.prepare('INSERT INTO friends (name, email) VALUES (@name, @email)');
for (const friend of friends) insertFriend.run(friend);

const insertedFriends = db.prepare('SELECT id, name FROM friends').all();
const friendId = (name) => insertedFriends.find((friend) => friend.name === name).id;

const expenses = [
  ['Groceries at Star Bazaar', 2475_00, 'Groceries', '2026-10-09', 'Monthly pantry restock'],
  ['Metro card recharge', 800_00, 'Transport', '2026-10-08', ''],
  ['Team dinner', 3680_00, 'Food', '2026-10-05', 'Split later with office group'],
  ['Electricity bill', 2190_00, 'Utilities', '2026-10-02', 'September bill'],
  ['Running shoes', 4999_00, 'Shopping', '2026-09-25', '']
];

const insertExpense = db.prepare(
  'INSERT INTO expenses (title, amount, category, spent_on, notes) VALUES (?, ?, ?, ?, ?)'
);
for (const expense of expenses) insertExpense.run(...expense);

const debts = [
  [friendId('Aarav Mehta'), 'Movie tickets', 640_00, 'owes_me', '2026-10-06', 'Two tickets'],
  [friendId('Nisha Rao'), 'Cab to airport', 1250_00, 'i_owe', '2026-10-03', 'Paid by Nisha'],
  [friendId('Kabir Sen'), 'Weekend groceries', 910_00, 'owes_me', '2026-09-30', '']
];

const insertDebt = db.prepare(
  'INSERT INTO debts (friend_id, title, amount, direction, debt_date, notes) VALUES (?, ?, ?, ?, ?, ?)'
);
for (const debt of debts) insertDebt.run(...debt);

const nishaDebt = db
  .prepare("SELECT id FROM debts WHERE title = 'Cab to airport' AND direction = 'i_owe'")
  .get();
db.prepare('INSERT INTO repayments (debt_id, amount, paid_on, notes) VALUES (?, ?, ?, ?)').run(
  nishaDebt.id,
  500_00,
  '2026-10-07',
  'Partial repayment'
);

console.log('Sample data inserted.');
