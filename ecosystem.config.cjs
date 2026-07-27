module.exports = {
  apps: [{
    name:   'harunabot',
    script: 'src/index.js',
    cwd:    __dirname,

    exec_mode:          'fork',
    instances:          1,
    autorestart:        true,
    watch:              false,
    max_restarts:       10,
    min_uptime:         '10s',
    max_memory_restart: '512M',
    kill_timeout:       10_000,
    listen_timeout:     30_000,

    env: {
      NODE_ENV: 'production',
    },

    out_file:         './logs/out.log',
    error_file:       './logs/error.log',
    log_date_format:  'YYYY-MM-DD HH:mm:ss Z',
    merge_logs:       true,
  }],
}
