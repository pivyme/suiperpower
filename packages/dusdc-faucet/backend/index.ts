import './dotenv.ts';

import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import FastifyCors from '@fastify/cors';
import { APP_PORT, IS_PROD } from './src/config/main-config.ts';

function validateConfig(): void {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  for (const k of required) {
    if (!process.env[k]) {
      console.error(`[fatal] missing env: ${k}`);
      process.exit(1);
    }
  }
  if (IS_PROD) {
    const prodRequired = [
      'FAUCET_PACKAGE_ID',
      'FAUCET_OBJECT_ID',
      'DUSDC_COIN_TYPE',
      'TURNSTILE_SECRET',
      'ALLOWED_ORIGIN',
    ];
    for (const k of prodRequired) {
      if (!process.env[k]) {
        console.error(`[fatal] missing prod env: ${k}`);
        process.exit(1);
      }
    }
  } else {
    if (!process.env.FAUCET_PACKAGE_ID) {
      console.warn('[warn] FAUCET_PACKAGE_ID unset, /faucet/stats will fail');
    }
    if (!process.env.TURNSTILE_SECRET) {
      console.warn('[warn] TURNSTILE_SECRET unset, /faucet/verify will auto-approve (dev)');
    }
  }
}

validateConfig();

// Routes
import { exampletRoute } from './src/routes/exampleRoutes.ts';
import { faucetRoutes } from './src/routes/faucetRoutes.ts';

// Workers
import { startErrorLogCleanupWorker } from './src/workers/errorLogCleanup.ts';
import { startStatsCacheWorker } from './src/workers/statsCacheWorker.ts';
import { startRateLimitCleanupWorker } from './src/workers/rateLimitCleanup.ts';

console.log(
  '======================\n======================\nMY BACKEND SYSTEM STARTED!\n======================\n======================\n'
);

const fastify = Fastify({
  logger: false,
});

fastify.register(FastifyCors, {
  origin: IS_PROD ? (process.env.ALLOWED_ORIGIN || '') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token'],
});

// Health check endpoint
fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(200).send({
    success: true,
    message: 'Hello there!',
    error: null,
    data: null,
  });
});

// Register routes with prefixes
// Example: fastify.register(adminRoutes, { prefix: '/admin' })
// Example: fastify.register(userRoutes, { prefix: '/user' })
fastify.register(exampletRoute, { prefix: '/example' });
fastify.register(faucetRoutes, { prefix: '/faucet' });

const start = async (): Promise<void> => {
  try {
    // Start workers
    startErrorLogCleanupWorker();
    startStatsCacheWorker();
    startRateLimitCleanupWorker();

    await fastify.listen({
      port: APP_PORT,
      host: '0.0.0.0',
    });

    const address = fastify.server.address();
    const port = typeof address === 'object' && address ? address.port : APP_PORT;

    console.log(`Server started successfully on port ${port}`);
    console.log(`http://localhost:${port}`);
  } catch (error) {
    console.log('Error starting server: ', error);
    process.exit(1);
  }
};

start();
