import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createServer as createViteServer } from 'vite';
import type { AppContainer } from '../app/container.js';
import { appRoot } from './register-prod-ssr.js';
import { buildHtml } from './html.js';
import { loadSsrPayload } from './load-ssr-payload.js';

export async function registerVite(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  const vite = await createViteServer({
    root: appRoot,
    server: { middlewareMode: true },
    appType: 'custom',
  });

  await app.register(import('@fastify/middie'));
  app.use(vite.middlewares);

  const template = readFileSync(join(appRoot, 'index.html'), 'utf-8');

  app.get('*', async (request: FastifyRequest, reply: FastifyReply) => {
    const url = request.url;
    if (url.startsWith('/api') || url.startsWith('/uploads')) return;

    try {
      const ssrData = await loadSsrPayload(url, container);
      const htmlTemplate = await vite.transformIndexHtml(url, template);
      const { renderPage } = await vite.ssrLoadModule(
        '/src/frontend/entry-server.tsx',
      );
      const { html, styles } = renderPage(url, ssrData);
      reply.type('text/html').send(buildHtml(htmlTemplate, html, styles, ssrData));
    } catch (err) {
      vite.ssrFixStacktrace(err as Error);
      request.log.error(err);
      reply.status(500).send('SSR error');
    }
  });
}
