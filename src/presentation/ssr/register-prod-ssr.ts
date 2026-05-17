import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { SsrPayload } from '../../domain/dto/photo-view.js';
import type { AppContainer } from '../app/container.js';
import { buildHtml } from './html.js';
import { loadSsrPayload } from './load-ssr-payload.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const appRoot = join(__dirname, '../../..');

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

  await app.register(import('@fastify/static'), {
    root: join(appRoot, 'dist/client'),
    prefix: '/',
    decorateReply: false,
    index: false,
  });

  app.get('*', async (request: FastifyRequest, reply: FastifyReply) => {
    const url = request.url;
    if (url.startsWith('/api') || url.startsWith('/uploads')) return;

    try {
      const ssrData = await loadSsrPayload(url, container);
      const { html, styles } = renderPage(url, ssrData);
      reply.type('text/html').send(buildHtml(template, html, styles, ssrData));
    } catch (err) {
      request.log.error(err);
      reply.status(500).send('SSR error');
    }
  });
}
