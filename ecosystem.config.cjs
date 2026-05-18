const path = require('node:path');

const root = __dirname;

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
    },
    env_production: {
      NODE_ENV: 'production',
    },
  },
];

module.exports = { apps };
