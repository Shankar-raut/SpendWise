import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';
import { openDatabase } from '../src/db/client.js';
import { runMigrations } from '../src/db/migrate.js';
import { createApp } from '../src/app.js';
import { hashPassword } from '../src/utils/auth.js';

let app;
let db;

beforeEach(() => {
  db = openDatabase(':memory:');
  runMigrations(db);
  db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(
    'Test User',
    'test@example.com',
    hashPassword('secret123')
  );
  app = createApp(db);
});

async function authHeaders(port) {
  const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'secret123' })
  });
  const payload = await response.json();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${payload.data.token}`
  };
}

test('creates expenses and returns summary totals', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const headers = await authHeaders(port);
    const createResponse = await fetch(`http://127.0.0.1:${port}/api/expenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Coffee',
        amount: 180,
        category: 'Food',
        date: '2026-10-12',
        notes: ''
      })
    });
    assert.equal(createResponse.status, 201);

    const summaryResponse = await fetch(`http://127.0.0.1:${port}/api/summary`, { headers });
    const summary = await summaryResponse.json();
    assert.equal(summary.data.totalSpending, 180);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('calculates outstanding debt balances after repayment', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const headers = await authHeaders(port);
    const friend = await fetch(`http://127.0.0.1:${port}/api/friends`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Rhea', email: '' })
    }).then((res) => res.json());

    const debt = await fetch(`http://127.0.0.1:${port}/api/debts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        friendId: friend.data.id,
        title: 'Lunch',
        amount: 600,
        direction: 'owes_me',
        date: '2026-10-10',
        notes: ''
      })
    }).then((res) => res.json());

    await fetch(`http://127.0.0.1:${port}/api/debts/${debt.data.id}/repayments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount: 250, date: '2026-10-11', notes: '' })
    });

    const summary = await fetch(`http://127.0.0.1:${port}/api/summary`, { headers }).then((res) => res.json());
    assert.equal(summary.data.moneyOwedToMe, 350);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('rejects invalid expense input', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const headers = await authHeaders(port);
    const response = await fetch(`http://127.0.0.1:${port}/api/expenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: '', amount: -20, category: '', date: 'bad' })
    });
    assert.equal(response.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('rejects protected routes without login', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/summary`);
    assert.equal(response.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
