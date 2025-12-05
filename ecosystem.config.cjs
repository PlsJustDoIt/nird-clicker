module.exports = {
  apps: [
    {
      name: "nird-clicker",
      script: "index.js",
      cwd: "/var/www/nird-clicker",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_file: ".env",
      error_file: "/var/log/pm2/nird-clicker-error.log",
      out_file: "/var/log/pm2/nird-clicker-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      time: true,
    },
  ],
};
