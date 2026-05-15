import Fastify, { type FastifyInstance } from 'fastify';
import { faucetRoutes } from '../../src/routes/faucetRoutes.ts';

export async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  app.register(faucetRoutes, { prefix: '/faucet' });
  await app.ready();
  return app;
}
