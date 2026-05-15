import jwt from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { prismaQuery } from '../lib/prisma.ts';
import { JWT_SECRET } from '../config/main-config.ts';
import { handleError } from '../utils/errorHandler.ts';

interface JwtPayload {
  userId: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      walletAddress: string;
      nonce: string | null;
      lastSignIn: Date | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply): Promise<true | FastifyReply> => {
  // Check if Authorization header exists
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return handleError(reply, 401, 'Missing or invalid authorization header', 'MISSING_AUTH_HEADER');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return handleError(reply, 401, 'Token not provided', 'TOKEN_MISSING');
  }

  let authData: JwtPayload;
  try {
    authData = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.log(`Token verification failed with error ${error}.`);
    return handleError(reply, 401, 'Invalid or expired token', 'INVALID_TOKEN', error as Error);
  }

  if (!authData.userId) {
    return handleError(reply, 401, 'Invalid token payload - missing user ID', 'INVALID_TOKEN_PAYLOAD');
  }

  const user = await prismaQuery.user.findUnique({
    where: {
      id: authData.userId,
    },
  });

  if (!user) {
    return handleError(reply, 401, 'User not found', 'USER_NOT_FOUND');
  }

  request.user = user;
  return true;
};
