import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyInstance } from 'fastify';
import { env } from '../../infra/config/env.js';
import { checkDb } from '../../infra/persistence/pool.js';
import { registerAdminRoutes } from '../http/routes/admin-routes.js';
import { registerPhotoRoutes } from '../http/routes/photo-routes.js';
import type { AppContainer } from './container.js';

export async function createApp(
  container: AppContainer,
): Promise<FastifyInstance> {
  await mkdir(env.uploadsDir, { recursive: true });
  await mkdir(join(env.uploadsDir, 'display'), { recursive: true });
  await mkdir(join(env.uploadsDir, 'thumb'), { recursive: true });

  const app = Fastify({ logger: true });

  await app.register(helmet, {
    contentSecurityPolicy: false,
    // HTTP (ex.: IP Tailscale) não é "trustworthy origin" — headers COOP/OAC geram avisos.
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    originAgentCluster: false,
  });

  // Só rotas que declaram rateLimit no config (upload, verify).
  // Limite global contava cada /uploads/* e estourava ao rolar o feed.
  await app.register(rateLimit, { global: false });

  await app.register(multipart, {
    limits: { fileSize: env.maxUploadBytes },
  });

  await app.register(fastifyStatic, {
    root: env.uploadsDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  app.get('/api/health', async () => {
    const dbOk = await checkDb();
    return { status: dbOk ? 'ok' : 'degraded', db: dbOk };
  });

  registerPhotoRoutes(app, container);
  registerAdminRoutes(app, container);

  app.setErrorHandler(
    (
      error: Error & { validation?: unknown; statusCode?: number },
      _request,
      reply,
    ) => {
      if (error.validation) {
        return reply.status(400).send({ error: error.message });
      }
      if (error.statusCode === 429) {
        return reply.status(429).send({ error: 'Too many requests' });
      }
      reply.status(500).send({ error: 'Internal server error' });
    },
  );

  return app;
}
