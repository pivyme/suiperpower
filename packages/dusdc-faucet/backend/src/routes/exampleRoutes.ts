import type { FastifyInstance, FastifyPluginCallback } from 'fastify';

export const exampletRoute: FastifyPluginCallback = (app: FastifyInstance, _opts, done) => {
  done();
};
