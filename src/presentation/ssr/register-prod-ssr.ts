import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { SsrPayload } from '../../domain/dto/photo-view.js';
import { env } from '../../infra/config/env.js';
import type { AppContainer } from '../app/container.js';
import { buildHtml } from './html.js';
import { loadSsrPayload } from './load-ssr-payload.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const appRoot = join(__dirname, '../../..');

const PUBLIC_ROOT_FILES = ['favicon.svg', 'grao.svg', 'grao-iso.svg'] as const;

export async function registerProdSsr(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  // @ts-ignore — bundle gerado pelo Vite SSR
  const { renderPage } = (await import('../../../dist/ssr/entry-server.js')) as {
    renderPage: (
      url: string,
      ssrData: SsrPayload,
    ) => { html: string; styles: string };
  };

  const template = readFileSync(
    join(appRoot, 'dist/client/index.html'),
    'utf-8',
  );

  const clientRoot = join(appRoot, 'dist/client');

  // Só /assets/* — não usar prefix "/" ou /uploads/* cai no dist/client e dá 404.
  await app.register(import('@fastify/static'), {
    root: join(clientRoot, 'assets'),
    prefix: '/assets/',
    decorateReply: false,
  });

  for (const file of PUBLIC_ROOT_FILES) {
    app.get(`/${file}`, async (_request, reply) => {
      return reply.sendFile(file, clientRoot);
    });
  }

  // Garante precedência do diretório de uploads sobre o fallback SSR.
  await app.register(import('@fastify/static'), {
    root: env.uploadsDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  app.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    const pathname = request.url.split('?')[0] ?? '';

    if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/uploads') ||
      pathname.startsWith('/assets')
    ) {
      return reply.code(404).send({ error: 'Not found' });
    }

    try {
      const ssrData = await loadSsrPayload(pathname, container);
      const { html, styles } = renderPage(pathname, ssrData);
      reply.type('text/html').send(buildHtml(template, html, styles, ssrData));
    } catch (err) {
      request.log.error(err);
      reply.status(500).send('SSR error');
    }
  });
}
