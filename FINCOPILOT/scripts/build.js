const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function log(msg) {
  console.log(`[build] ${msg}`);
}

try {
  const rootDir = path.resolve(__dirname, "..");
  const frontendDir = path.join(rootDir, "frontend");
  const backendDir = path.join(rootDir, "backend");
  const distDir = path.join(frontendDir, "dist");
  const targetDir = path.join(backendDir, "public", "dist");

  // 1. Build frontend
  log("Installing frontend dependencies...");
  execSync("npm install", { cwd: frontendDir, stdio: "inherit" });

  log("Building frontend React application...");
  execSync("npm run build", { cwd: frontendDir, stdio: "inherit" });

  // 2. Clean & recreate backend target directory
  log("Recreating backend public directory...");
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // 3. Copy files recursively
  log(`Copying built frontend from ${distDir} to ${targetDir}...`);
  fs.cpSync(distDir, targetDir, { recursive: true });

  log("Build process completed successfully!");
} catch (error) {
  console.error("[build] Failed with error:", error.message);
  process.exit(1);
}
