/**
 * PM2 cluster mode: Node.js is single-threaded, so one `node server.js`
 * process can only use one CPU core. PM2's cluster mode forks one worker
 * per core, each running the full Express app, and load-balances incoming
 * connections across them round-robin - the simplest way to get a
 * multi-core machine actually handling 1000+ concurrent users instead of
 * leaving cores idle.
 *
 * Usage:
 *   npm install -g pm2
 *   pm2 start ecosystem.config.js --env production
 *   pm2 logs fincopilot-api
 *   pm2 monit
 *
 * Because auth is stateless JWT (no server-side session), and demo-mode's
 * in-memory store is the only thing that *wouldn't* be shared across
 * workers, run PERSISTENT MODE (MySQL) when using more than one worker -
 * otherwise each worker has its own separate in-memory "database" and
 * users would inconsistently land on different ones between requests.
 */
module.exports = {
  apps: [
    {
      name: "fincopilot-api",
      script: "./server.js",
      instances: "max", // one worker per CPU core; use a number to cap it
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
      },
      max_memory_restart: "300M",
      autorestart: true,
    },
  ],
};
