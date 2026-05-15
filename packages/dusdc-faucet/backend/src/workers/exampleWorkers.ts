import type { FastifyInstance, FastifyPluginCallback } from 'fastify';

export const exampletWorker: FastifyPluginCallback = (_app: FastifyInstance, _opts, done) => {
  done();
};
