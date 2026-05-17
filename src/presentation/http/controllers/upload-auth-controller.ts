import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../../../infra/config/env.js';

export class UploadAuthController {
  verify = async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Senha incorreta' });
    }
    const token = header.slice(7);
    if (token !== env.uploadPassword) {
      return reply.status(401).send({ error: 'Senha incorreta' });
    }
    return { ok: true };
  };
}
