import { existsSync } from "node:fs";
import { config as loadEnv } from "dotenv";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Raiz do repo: PM2 usa cwd; fallback pelo caminho do build em dist/. */
function findProjectRoot(): string {
  const cwd = process.cwd();
  if (existsSync(join(cwd, "package.json"))) return cwd;

  const fromDist = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
  if (existsSync(join(fromDist, "package.json"))) return fromDist;

  return cwd;
}

const projectRoot = findProjectRoot();

loadEnv({
  path: join(projectRoot, ".env"),
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in .env");
}

/**
 * Sempre relativo à pasta do projeto (cwd do PM2).
 * Evita UPLOADS_DIR=/data/... ir parar na raiz do sistema.
 */
function resolveUploadsDir(raw: string): string {
  const trimmed = raw.trim() || "data";

  if (isAbsolute(trimmed)) {
    // Docker: /app/data — mantém absoluto
    if (trimmed.startsWith("/app/")) return trimmed;
    // Typo comum no servidor: /data ou /data/uploads → ./data/...
    if (trimmed === "/data" || trimmed.startsWith("/data/")) {
      return resolve(projectRoot, trimmed.replace(/^\/+/, ""));
    }
    return trimmed;
  }

  return resolve(projectRoot, trimmed);
}

const uploadsDirRaw = process.env.UPLOADS_DIR ?? "data";

export const env = {
  projectRoot,
  databaseUrl: process.env.DATABASE_URL,
  uploadsDir: resolveUploadsDir(uploadsDirRaw),
  uploadPassword: process.env.ADMIN_PASSWORD ?? "grao-dev",
  port: Number(process.env.PORT ?? 3000),
  maxUploadBytes: 15 * 1024 * 1024,
} as const;
