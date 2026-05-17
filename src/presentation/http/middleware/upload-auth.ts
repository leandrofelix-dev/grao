import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../../../infra/config/env.js';

export async function requireUploadAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  const token = header.slice(7);
  if (token !== env.uploadPassword) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
}
