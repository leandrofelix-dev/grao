import { config as loadEnv } from 'dotenv';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');

loadEnv({
  path: join(projectRoot, '.env'),
});

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in .env');
}

const uploadsDirRaw = process.env.UPLOADS_DIR ?? 'data/uploads';

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  uploadsDir: resolve(projectRoot, uploadsDirRaw),
  uploadPassword: process.env.ADMIN_PASSWORD ?? 'grao-dev',
  port: Number(process.env.PORT ?? 3000),
  maxUploadBytes: 15 * 1024 * 1024,
} as const;
