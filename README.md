# grão

Galeria pessoal de fotos, inspirada em feeds minimalistas (estilo VSCO). Um único servidor entrega a API, os arquivos de imagem e o React com SSR.

## O que faz

- **Feed público** (`/`) — grade masonry, scroll infinito, visualização em tela cheia com legenda e data
- **Tema claro/escuro** — persistido no navegador
- **Painel admin** (`/admin`) — protegido por senha:
  - envio de fotos (várias de uma vez, legenda opcional)
  - editar legenda
  - arquivar / desarquivar (some do feed sem apagar arquivos)
  - excluir permanentemente
- **`/upload`** — redireciona para `/admin`

Formatos aceitos: JPEG, PNG, WebP e HEIC (convertido para JPEG via `heic-convert` + `sharp`). Metadados EXIF/GPS são removidos no processamento.

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Runtime | Node 24, Yarn 4, TypeScript |
| Backend | Fastify, PostgreSQL (`pg`), rate limit, multipart |
| Imagens | sharp, heic-convert |
| Frontend | React 19, React Router, styled-components, Vite |
| Arquitetura | Clean Architecture (`domain` → `infra` → `presentation` + `frontend`) |

## Estrutura

```
src/
├── domain/          # entidades, DTOs, contratos, casos de uso
├── infra/           # Postgres, sharp, env
├── presentation/    # HTTP, SSR, bootstrap Fastify
└── frontend/        # páginas e componentes React
migrations/          # SQL versionado
public/              # logo, favicon
```

## Configuração

Copie `.env.example` para `.env`:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/grao
UPLOADS_DIR=data
PORT=3000
ADMIN_PASSWORD=sua-senha-segura
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | sim | Conexão PostgreSQL |
| `UPLOADS_DIR` | não | Pasta de fotos **relativa ao projeto** (padrão: `data` → `./data/display`, `./data/thumb`). Não use `/data/...` (vai para a raiz do Linux). |
| `PORT` | não | Porta HTTP (padrão: `3000`) |
| `ADMIN_PASSWORD` | não | Senha do `/admin` (padrão: `grao-dev`) |

## Desenvolvimento

```bash
asdf exec yarn install
asdf exec yarn db:migrate
asdf exec yarn dev
```

Abra [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `yarn dev` | Servidor com hot reload (API + Vite SSR) |
| `yarn build` | Build de produção (client, SSR e servidor) |
| `yarn start` | Roda `dist/presentation/app/index.js` |
| `yarn db:migrate` | Aplica migrations pendentes |

## Produção

### PM2

Requisitos: Node 24, `yarn build`, `.env` na raiz do projeto.

No servidor o projeto costuma ficar em `/opt/workspace/pm2/grao`. O `ecosystem.config.cjs` usa `__dirname` como raiz e grava fotos em **`/opt/workspace/pm2/grao/data`** (`display/` e `thumb/`).

```bash
cd /opt/workspace/pm2/grao
yarn build
yarn db:migrate

npm install -g pm2

pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup   # opcional: subir após reboot
```

Confira nos logs: `Project root` e `Uploads directory` devem apontar para `/opt/workspace/pm2/grao` e `.../grao/data`.

Comandos úteis: `pm2 status`, `pm2 logs grao`, `pm2 reload grao --update-env`, `pm2 stop grao`.

### Docker

Ajuste `DATABASE_URL` no `.env`:

```bash
docker compose up -d --build
```

## API (resumo)

| Rota | Auth | Uso |
|------|------|-----|
| `GET /api/photos` | — | Feed público (só publicadas) |
| `POST /api/photos` | Bearer | Upload |
| `GET /api/admin/photos` | Bearer | Listagem admin (`filter=published\|archived`) |
| `PATCH /api/admin/photos/:id` | Bearer | Legenda e/ou arquivar |
| `DELETE /api/admin/photos/:id` | Bearer | Exclusão |
| `POST /api/upload/verify` | Bearer | Valida senha no login |

## Licença

Projeto privado.
