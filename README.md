# SpendWise

SpendWise is a full-stack expense tracking web app for managing personal spending, friends, debts, and repayments from one clean dashboard. It uses a React + Vite frontend, an Express API, and a local SQLite database for development.

The app is built to run completely on a laptop first: the backend owns all database access, data persists across restarts, and migrations/seed scripts are included for repeatable setup.

## Features

- Dashboard summary for total spending, monthly spending, money owed, and money others owe you
- Login page with backend-backed token authentication
- Add, edit, and delete expenses
- Store expense title, amount in INR, category, date, and notes
- Add friends and track debts
- Record repayments against open debts
- Automatic outstanding balance calculations
- Search and filter transaction history
- Dark responsive UI with subtle glass-style panels
- SQLite migrations and development seed data
- Backend repository layer designed to make a future PostgreSQL switch easier
- Backend API tests using Node's built-in test runner

## Tech Stack

**Frontend**

- React 19
- Vite
- TypeScript
- Lucide React icons
- CSS

**Backend**

- Node.js 24+
- Express 5
- SQLite via Node's built-in `node:sqlite`
- Dotenv
- Token-based authentication using Node crypto utilities

**Development**

- Concurrent frontend/backend dev server
- SQL migrations
- Sample data seeding
- Node test runner

## Screenshots

Screenshots are not included in the repository yet. Run the app locally to view the login screen, dashboard, expense forms, debt cards, and transaction history.

## Getting Started

### Prerequisites

- Node.js `24` or newer
- npm

Check your versions:

```bash
node --version
npm --version
```

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
copy .env.example .env
```

Apply database migrations:

```bash
npm run db:migrate
```

Seed development data:

```bash
npm run db:seed
```

The seed command creates this local demo account:

```text
Email: demo@spendwise.local
Password: password123
```

Start the frontend and backend together:

```bash
npm run dev
```

Open the app:

```text
http://127.0.0.1:5173
```

The API runs at:

```text
http://127.0.0.1:4000
```

## Available Scripts

```bash
npm run dev          # Start React and Express together
npm run dev:client   # Start only the Vite frontend
npm run dev:server   # Start only the Express backend
npm run db:migrate   # Apply SQLite migrations
npm run db:seed      # Insert sample development data
npm test             # Run backend API tests
npm run build        # Type-check and build the frontend
npm run preview      # Preview the built frontend
npm start            # Start the backend server
```

## Environment Variables

Copy `.env.example` to `.env` for local development.

```env
PORT=4000
DATABASE_URL=./server/data/spendwise.sqlite
CLIENT_ORIGIN=http://127.0.0.1:5173
VITE_API_URL=http://127.0.0.1:4000/api
AUTH_SECRET=change-this-local-secret
```

Notes:

- Keep `.env` private. It is ignored by Git.
- `DATABASE_URL` is used only by the backend.
- `VITE_API_URL` is safe for the frontend because it only points to the API URL.
- Change `AUTH_SECRET` before deploying.

## Project Structure

```text
.
├── server/
│   ├── migrations/          # SQL database migrations
│   ├── scripts/             # Migration and seed scripts
│   ├── src/
│   │   ├── db/              # SQLite client and migration runner
│   │   ├── repositories/    # Database access layer
│   │   ├── routes/          # Express route modules
│   │   ├── utils/           # Auth and validation helpers
│   │   ├── app.js           # Express app setup
│   │   └── index.js         # API server entry point
│   └── tests/               # Backend API tests
├── src/
│   ├── App.tsx              # Main React application
│   ├── api.ts               # Frontend API client
│   ├── index.css            # UI styling
│   ├── main.tsx             # React entry point
│   └── types.ts             # Frontend TypeScript types
├── .env.example             # Example environment configuration
├── package.json             # Scripts and dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Development Status

SpendWise currently supports local full-stack development with working authentication, expense tracking, friend/debt management, repayments, SQLite persistence, migrations, seed data, and backend tests.

## Roadmap

- Add user registration and password reset flows
- Add charts for spending by category and month
- Add CSV export for expenses and debts
- Add screenshot assets to this README
- Add PostgreSQL support for production deployments
- Add end-to-end browser tests

## Deployment Notes

The frontend can be deployed to a static host such as Netlify, Vercel, or Cloudflare Pages.

The Express API can be deployed to a Node-compatible host. SQLite is ideal for local development, but many free serverless platforms do not provide durable local disk. For production, use a persistent database such as PostgreSQL and keep database credentials only in backend environment variables.

## License

No license file is currently included.
