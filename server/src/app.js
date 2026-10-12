import cors from 'cors';
import express from 'express';
import { privateAuthRoutes, publicAuthRoutes } from './routes/auth.js';
import { debtRoutes } from './routes/debts.js';
import { expenseRoutes } from './routes/expenses.js';
import { friendRoutes } from './routes/friends.js';
import { createDebtRepository } from './repositories/debtRepository.js';
import { createExpenseRepository } from './repositories/expenseRepository.js';
import { createFriendRepository } from './repositories/friendRepository.js';
import { createUserRepository } from './repositories/userRepository.js';
import { requireAuth } from './utils/auth.js';
import { ApiError } from './utils/validation.js';

export function createApp(db, options = {}) {
  const app = express();
  const expenses = createExpenseRepository(db);
  const friends = createFriendRepository(db);
  const debts = createDebtRepository(db);
  const users = createUserRepository(db);

  app.use(cors({ origin: options.clientOrigin || true }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', publicAuthRoutes(users));
  app.use('/api', requireAuth);
  app.use('/api/auth', privateAuthRoutes());

  app.get('/api/summary', (_req, res) => {
    res.json({ data: { ...expenses.totals(), ...debts.totals() } });
  });

  app.use('/api/expenses', expenseRoutes(expenses));
  app.use('/api/friends', friendRoutes(friends));
  app.use('/api/debts', debtRoutes(debts, friends));

  app.use((error, _req, res, _next) => {
    const status = error instanceof ApiError ? error.status : 500;
    const message = status === 500 ? 'Something went wrong.' : error.message;

    if (status === 500) {
      console.error(error);
    }

    res.status(status).json({ error: message });
  });

  return app;
}
