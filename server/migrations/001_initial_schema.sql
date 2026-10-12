CREATE TABLE friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  spent_on TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE debts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  friend_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  direction TEXT NOT NULL CHECK (direction IN ('i_owe', 'owes_me')),
  debt_date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (friend_id) REFERENCES friends(id) ON DELETE CASCADE
);

CREATE TABLE repayments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  debt_id INTEGER NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  paid_on TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE
);

CREATE INDEX idx_expenses_spent_on ON expenses(spent_on);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_debts_friend_id ON debts(friend_id);
CREATE INDEX idx_repayments_debt_id ON repayments(debt_id);
