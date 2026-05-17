import { runMigrations } from '../../infra/persistence/migrate-on-startup.js';
import { env } from '../../infra/config/env.js';
import { createApp } from './create-app.js';
import { createContainer } from './container.js';

const isProd = process.env.NODE_ENV === 'production';

async function main() {
  await runMigrations();

  const container = createContainer();
  const app = await createApp(container);

  if (isProd) {
    const { registerProdSsr } = await import('../ssr/register-prod-ssr.js');
    await registerProdSsr(app, container);
  } else {
    const { registerVite } = await import('../ssr/register-vite.js');
    await registerVite(app, container);
  }

  await app.listen({ port: env.port, host: '0.0.0.0' });
  console.log(`Grão listening on http://localhost:${env.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
