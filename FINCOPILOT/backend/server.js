require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const { connectDB, closeDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { hashPassword } = require("./utils/authUtils");
const memoryStore = require("./utils/memoryStore");

const authRoutes       = require("./routes/authRoutes");
const creditRoutes     = require("./routes/creditRoutes");
const fraudRoutes      = require("./routes/fraudRoutes");
const kycRoutes        = require("./routes/kycRoutes");
const climateRoutes    = require("./routes/climateRoutes");
const chatRoutes       = require("./routes/chatRoutes");
const dashboardRoutes  = require("./routes/dashboardRoutes");
const cyberRoutes      = require("./routes/cyberRoutes");
const walletRoutes     = require("./routes/walletRoutes");
const adminRoutes      = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.set("trust proxy", 1);

// ── Security & perf middleware ──────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));   // CSP off so React SPA loads
app.use(compression());
app.use(cors({
  origin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(","),
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000, limit: 500,
  standardHeaders: true, legacyHeaders: false,
}));
app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000, limit: 30,
  standardHeaders: true, legacyHeaders: false,
}));

// ── API Routes ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status:        "ok",
    mode:          global.FINCOPILOT_DEMO_MODE ? "DEMO" : "PERSISTENT",
    service:       "FinCopilot API",
    uptimeSeconds: Math.round(process.uptime()),
    node:          process.version,
    env:           process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth",         authRoutes);
app.use("/api/credit-score", creditRoutes);
app.use("/api/fraud",        fraudRoutes);
app.use("/api/kyc",          kycRoutes);
app.use("/api/climate-risk", climateRoutes);
app.use("/api/chat",         chatRoutes);
app.use("/api/dashboard",    dashboardRoutes);
app.use("/api/cyber",        cyberRoutes);
app.use("/api/wallet",       walletRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/notifications", notificationRoutes);

// ── Serve React SPA (production) ────────────────────────────────────────────
// The frontend is built into backend/public/dist by the Render build command.
// In development this block is skipped and Vite's dev server handles the UI.
const DIST_DIR = path.join(__dirname, "public", "dist");
if (process.env.NODE_ENV === "production" && fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get("*", (req, res) => {
    // Don't catch API 404s here – let the errorHandler below handle those.
    if (req.path.startsWith("/api")) return;
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

// ── Error handlers ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Demo-mode admin seed ───────────────────────────────────────────────────
async function seedDemoAdmin() {
  if (!global.FINCOPILOT_DEMO_MODE) return;
  const email    = process.env.ADMIN_EMAIL    || "admin@fincopilot.local";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const passwordHash = await hashPassword(password);
  memoryStore.insertUser({ name: "FinCopilot Admin", email, passwordHash, role: "admin" });
  console.log(`\n  [demo] Admin → email: ${email}   password: ${password}\n`);
}

// ── Boot ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
let server;

async function start() {
  await connectDB();
  await seedDemoAdmin();
  server = app.listen(PORT, () => {
    console.log(`  FinCopilot API → http://localhost:${PORT}`);
    console.log(`  Mode: ${global.FINCOPILOT_DEMO_MODE ? "DEMO (in-memory)" : "PERSISTENT (MySQL)"}`);
    if (process.env.NODE_ENV === "production" && fs.existsSync(DIST_DIR)) {
      console.log(`  Serving React SPA from ${DIST_DIR}`);
    }
  });
}

async function shutdown(signal) {
  console.log(`\n[server] ${signal} → graceful shutdown…`);
  if (server) server.close(async () => { await closeDB(); process.exit(0); });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

start();
module.exports = app;
