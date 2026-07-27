// PM2 Ecosystem Config
// Jalankan: pm2 start ecosystem.config.cjs
// Atau:     pm2 start ecosystem.config.cjs --env production

module.exports = {
  apps: [
    {
      name:         'harunabot',
      script:       'src/app.js',
      interpreter:  'node',

      // Auto-restart kalau crash
      autorestart:  true,
      watch:        false,   // Jangan watch — pakai hot-reload internal
      max_restarts: 10,
      min_uptime:   '10s',   // Kalau crash < 10s, anggap crash loop

      // Memory limit — restart kalau > 512MB
      max_memory_restart: '512M',

      // Environment
      env: {
        NODE_ENV:  'development',
        LOG_LEVEL: 'debug',
      },
      env_production: {
        NODE_ENV:      'production',
        LOG_LEVEL:     'info',
        AUTH_BACKEND:  'sqlite',   // Pakai SQLite auth di production
      },

      // Log files
      out_file:    './logs/out.log',
      error_file:  './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Cron restart — restart jam 4 pagi tiap hari (optional)
      // cron_restart: '0 4 * * *',

      // Merge logs dari semua instance (kalau cluster mode)
      merge_logs: true,
    },
  ],
}
