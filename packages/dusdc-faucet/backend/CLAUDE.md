# Backend Development Guidelines

## CRITICAL DATABASE WARNING

**NEVER EVER run any Prisma command that will reset/wipe the database.** If schema changes are needed, tell the user to run `bun run db:push` themselves. Commands like `prisma migrate reset`, `prisma db push --force-reset`, or any destructive database operations are strictly forbidden.

---

## Commands

Runtime is **Bun**, not Node. Framework is **Fastify**. All scripts run via `bun`.

```bash
bun dev              # Start with file watcher on :3700
bun start            # Production start (no watch)
bun run lint         # ESLint
bun run db:push      # Push schema + regenerate client
bun run db:pull      # Pull schema from existing DB
bun run db:generate  # Regenerate Prisma client only
bun run db:migrate   # Create a new migration
```

Env is loaded by `dotenv.ts`, which is imported at the top of `index.ts` before any other module. Copy `.env.example` to `.env`. Required: `DATABASE_URL`, `JWT_SECRET`. Optional: `APP_PORT` (default 3700), `ALLOWED_ORIGIN` (required in production for CORS).

This is part of a monorepo. Sibling `web/` is the TanStack Start frontend.

---

## Project Structure

```
/
├── index.ts                 # Entry point - registers all routes & workers
├── dotenv.ts                # Environment loader
├── tsconfig.json            # TypeScript configuration
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── config/
│   │   └── main-config.ts   # Centralized env config
│   ├── routes/              # Route handlers (grouped by prefix)
│   │   └── exampleRoutes.ts
│   ├── workers/             # Cron jobs / background tasks
│   │   └── errorLogCleanup.ts
│   ├── middlewares/         # Request middlewares
│   │   └── authMiddleware.ts
│   ├── utils/               # Low-level utilities
│   │   ├── errorHandler.ts
│   │   ├── validationUtils.ts
│   │   ├── miscUtils.ts
│   │   └── timeUtils.ts
│   └── lib/                 # External integrations
│       ├── prisma.ts        # Database client
│       └── evm/             # Example: EVM integrations
```

---

## Configuration (`src/config/main-config.ts`)

All commonly used environment variables are centralized here. Import from config instead of using `process.env` directly:

```ts
import { JWT_SECRET, APP_PORT, IS_DEV } from '../config/main-config.ts';
```

**Available exports:**
- `APP_PORT: number` - Server port (default: 3700)
- `NODE_ENV: string` - Environment mode
- `IS_DEV: boolean` / `IS_PROD: boolean` - Boolean flags
- `DATABASE_URL: string` - Database connection string
- `JWT_SECRET: string` - JWT signing secret
- `JWT_EXPIRES_IN: string` - Token expiration (default: '7d')
- `ERROR_LOG_MAX_RECORDS: number` - Max error logs (default: 10000)

---

## Error Handling (`src/utils/errorHandler.ts`)

Always use the centralized error handler for consistent responses and automatic database logging:

```ts
import { handleError, handleNotFoundError, handleUnauthorizedError } from '../utils/errorHandler.ts';

// Generic error
return handleError(reply, 401, 'User not authenticated', 'USER_NOT_AUTHENTICATED');

// With original error and context
return handleError(reply, 500, 'Failed to process', 'PROCESS_FAILED', originalError, { orderId });

// Convenience methods
return handleValidationError(reply, ['email', 'password']);
return handleNotFoundError(reply, 'User');
return handleUnauthorizedError(reply, 'Session expired');
return handleForbiddenError(reply, 'Admin access required');
return handleDatabaseError(reply, 'create user', originalError);
return handleServerError(reply, originalError);
```

Error logs are automatically capped at 10,000 records by the cleanup worker.

---

## Request Validation (`src/utils/validationUtils.ts`)

Use `validateRequiredFields` for request body validation:

```ts
import { validateRequiredFields } from '../utils/validationUtils.ts';

app.post('/register', async (request, reply) => {
  const validation = await validateRequiredFields(request.body as Record<string, unknown>, ['email', 'password'], reply);
  if (validation !== true) return;

  // Proceed with validated data
});
```

---

## Route Registration Pattern

Routes are grouped by prefix. Each route file exports a Fastify plugin:

**Route file (`src/routes/adminRoutes.ts`):**
```ts
import type { FastifyInstance, FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

export const adminRoutes: FastifyPluginCallback = (app: FastifyInstance, _opts, done) => {
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    // Handler for POST /admin/login
  });

  app.get('/users', { preHandler: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Protected route: GET /admin/users
  });

  done();
};
```

**Registration in `index.ts`:**
```ts
import { adminRoutes } from './src/routes/adminRoutes.ts';
import { userRoutes } from './src/routes/userRoutes.ts';

fastify.register(adminRoutes, { prefix: '/admin' });
fastify.register(userRoutes, { prefix: '/user' });
```

---

## Worker Pattern (`src/workers/`)

Workers use `node-cron` with an `isRunning` flag to prevent double execution:

```ts
import cron from 'node-cron';

let isRunning = false;

const myTask = async (): Promise<void> => {
  if (isRunning) {
    console.log('[MyWorker] Previous run still active, skipping...');
    return;
  }

  isRunning = true;
  try {
    // Do work
  } catch (error) {
    console.error('[MyWorker] Error:', error);
  } finally {
    isRunning = false;
  }
};

export const startMyWorker = (): void => {
  console.log('[MyWorker] Scheduled');
  cron.schedule('*/5 * * * *', myTask); // Every 5 minutes
  myTask(); // Optional: run immediately on startup
};
```

**Register in `index.ts`:**
```ts
import { startMyWorker } from './src/workers/myWorker.ts';

const start = async (): Promise<void> => {
  startMyWorker();
  // ...
};
```

---

## Authentication Middleware

Protected routes use `authMiddleware` as a preHandler:

```ts
import { authMiddleware } from '../middlewares/authMiddleware.ts';

app.get('/profile', { preHandler: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user; // Available after auth (typed via module augmentation)
});
```

---

## External Integrations (`src/lib/`)

External service integrations go in `src/lib/`:

```
src/lib/
├── prisma.ts       # Database
├── evm/            # EVM/Ethereum integrations
├── solana/         # Solana integrations
└── jupiter/        # Jupiter API
```

Example structure:
```ts
// src/lib/evm/index.ts
import { ethers, JsonRpcProvider } from 'ethers';

export const getProvider = (rpcUrl: string): JsonRpcProvider => new ethers.JsonRpcProvider(rpcUrl);
export const verifySignature = (message: string, signature: string, address: string): boolean => { /* ... */ };
```

---

## Database Usage

Import the Prisma client from lib:

```ts
import { prismaQuery } from '../lib/prisma.ts';

const user = await prismaQuery.user.findUnique({ where: { id } });
```

---

## Standard Response Format

All responses should follow this structure:

```ts
// Success
reply.code(200).send({
  success: true,
  error: null,
  data: { /* response data */ },
});

// Error (handled automatically by errorHandler)
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human readable message'
  },
  data: null,
  timestamp: '2024-01-01T00:00:00.000Z'
}
```

---

## Common Utilities (`src/utils/`)

**miscUtils.ts:**
- `sleep(ms: number): Promise<void>` - Promise-based delay
- `getAlphanumericId(length?: number): string` - Generate random alphanumeric ID
- `shortenAddress(address: string, startLength?: number, endLength?: number): string` - Truncate wallet addresses

**timeUtils.ts:**
- `getCurrentTime(): string` - ISO timestamp
- `getCurrentTimeUnix(): number` - Unix timestamp
- `convertDateToUnix(date: Date): number` - Date to Unix
- `manyMinutesAgoUnix(minutes: number): number` - Timestamp X minutes ago

---

## Quick Reference

| Task | Solution |
|------|----------|
| Add env variable | Add to `main-config.ts` |
| Handle errors | Use `handleError()` from errorHandler |
| Validate request body | Use `validateRequiredFields()` |
| Add new route group | Create file in `src/routes/`, register in `index.ts` |
| Add background job | Create file in `src/workers/`, use `isRunning` flag |
| Add external integration | Create folder in `src/lib/` |
| Protect route | Add `{ preHandler: [authMiddleware] }` |
| Lint | Run `bun run lint` |
