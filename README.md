# SpendWise

A simple spending tracker app for managing expenses, friends, and debts.

## Features

- Track daily expenses
- View totals and summaries
- Add friends
- Track who owes what
- Record repayments
- Works on the same Wi‑Fi network

## Tech

- React + Vite
- TypeScript
- Express
- SQLite

## Run locally

```bash
npm install
npm run dev
```

Then open:

```text
http://10.196.216.112:5173
```

This works from other devices on the same Wi‑Fi network too.

## Environment

```env
PORT=4000
DATABASE_URL=./server/data/spendwise.sqlite
CLIENT_ORIGIN=http://10.196.216.112:5173
VITE_API_URL=http://10.196.216.112:4000/api
AUTH_SECRET=spendwise-local-development-secret
```

## Scripts

```bash
npm run dev
npm run db:migrate
npm run db:seed
npm test
```

## Demo login

```text
Email: demo@spendwise.local
Password: password123
```
