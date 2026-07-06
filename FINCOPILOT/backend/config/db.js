const { Sequelize } = require("sequelize");

/**
 * FinCopilot can run in two modes:
 *
 *  1. PERSISTENT MODE - a real MySQL instance is reachable using the
 *     DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD values in .env.
 *     All data (users, loan applications, transactions, KYC records,
 *     wallet activity) is durable and visible in MySQL Workbench.
 *
 *  2. DEMO MODE - DB_HOST (or the whole block) is left unset, or the
 *     connection attempt fails. FinCopilot automatically falls back to
 *     an in-memory store (see utils/memoryStore.js) so the whole app -
 *     including signup/login - still runs end-to-end with zero setup.
 *
 * global.FINCOPILOT_DEMO_MODE is the single flag every service/controller
 * checks to decide whether to talk to Sequelize models or the memory store.
 */

let sequelize = null;

function buildSequelize() {
  return new Sequelize(
    process.env.DB_NAME || "fincopilot",
    process.env.DB_USER || "fincopilot_user",
    process.env.DB_PASSWORD || "FinCopilot@2024",
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
      // Sized for concurrent load: each Node process holds up to `max`
      // connections. MySQL's default max_connections is 151, so with the
      // PM2 cluster setup in ecosystem.config.js (workers = CPU cores),
      // keep `max` × (worker count) comfortably under your DB's limit -
      // e.g. 4 workers × 20 = 80 connections, well under 151. Bump
      // max_connections on the DB server itself if you scale further.
      pool: { max: 20, min: 2, idle: 10000, acquire: 30000 },
      retry: { max: 3 },
      dialectOptions: { connectTimeout: 10000 },
    }
  );
}

async function connectDB() {
  if (!process.env.DB_HOST) {
    console.warn("[db] DB_HOST not set -> starting in DEMO MODE (in-memory store).");
    global.FINCOPILOT_DEMO_MODE = true;
    return;
  }

  try {
    sequelize = buildSequelize();
    await sequelize.authenticate();

    // Load models + associations now that we have a live connection.
    require("../models")(sequelize);
    await sequelize.sync(); // creates tables if they don't exist yet

    global.FINCOPILOT_DEMO_MODE = false;
    console.log(`[db] Connected to MySQL (${process.env.DB_NAME}) - running in PERSISTENT MODE.`);
  } catch (err) {
    console.error(`[db] MySQL connection failed: ${err.message}`);
    console.warn("[db] Falling back to DEMO MODE (in-memory store).");
    global.FINCOPILOT_DEMO_MODE = true;
  }
}

function getSequelize() {
  return sequelize;
}

async function closeDB() {
  if (sequelize) await sequelize.close();
}

module.exports = { connectDB, getSequelize, closeDB };
