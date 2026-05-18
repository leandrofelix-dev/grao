const path = require('node:path');

// Raiz do repo (no servidor: /opt/workspace/pm2/grao)
const root = __dirname;
const uploadsDir = path.join(root, 'data');

/** @type {import('pm2').StartOptions[]} */
const apps = [
  {
    name: 'grao',
    script: path.join(root, 'dist/presentation/app/index.js'),
    cwd: root,
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    merge_logs: true,
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    out_file: path.join(root, 'logs/pm2-out.log'),
    error_file: path.join(root, 'logs/pm2-error.log'),
    env: {
      NODE_ENV: 'development',
      UPLOADS_DIR: uploadsDir,
    },
    env_production: {
      NODE_ENV: 'production',
      UPLOADS_DIR: uploadsDir,
    },
  },
];

module.exports = { apps };
