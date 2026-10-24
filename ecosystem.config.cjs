// PM2 — VPS Hostinger : pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'flamingo-auto',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 0.0.0.0 -p 3000',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
