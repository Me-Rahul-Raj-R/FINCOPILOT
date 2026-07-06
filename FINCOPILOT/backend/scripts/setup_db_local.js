const mysql = require("mysql2/promise");

async function setup() {
  const commonPasswords = ["", "root", "admin", "123456", "password", "FinCopilot@2024"];
  let connection = null;

  console.log("[db-setup] Searching for local MySQL instance on localhost:3306...");

  for (const password of commonPasswords) {
    try {
      connection = await mysql.createConnection({
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: password
      });
      console.log(`[db-setup] Connected to MySQL as 'root' using password: ${password === "" ? "(empty)" : `'${password}'`}`);
      break;
    } catch (err) {
      // Continue searching
    }
  }

  if (!connection) {
    console.error("[db-setup] FAILED: Could not connect to local MySQL as 'root' with common passwords.");
    console.error("[db-setup] Please make sure MySQL Server is running locally.");
    console.error("[db-setup] Or run backend/setup_db.sql manually in MySQL Workbench as root.");
    process.exit(1);
  }

  try {
    console.log("[db-setup] Creating database 'fincopilot' if not exists...");
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS fincopilot 
       CHARACTER SET utf8mb4 
       COLLATE utf8mb4_unicode_ci;`
    );
    console.log("[db-setup] Database 'fincopilot' verified/created.");

    console.log("[db-setup] Creating user 'fincopilot_user' if not exists...");
    await connection.query(
      `CREATE USER IF NOT EXISTS 'fincopilot_user'@'localhost' 
       IDENTIFIED BY 'FinCopilot@2024';`
    );
    
    console.log("[db-setup] Updating user password and authentication...");
    await connection.query(
      `ALTER USER 'fincopilot_user'@'localhost' 
       IDENTIFIED BY 'FinCopilot@2024';`
    );

    console.log("[db-setup] Granting privileges on 'fincopilot' to 'fincopilot_user'...");
    await connection.query(
      `GRANT ALL PRIVILEGES ON fincopilot.* TO 'fincopilot_user'@'localhost';`
    );
    await connection.query("FLUSH PRIVILEGES;");

    console.log("\n==================================================");
    console.log(" SUCCESS: Local MySQL database initialized!");
    console.log("==================================================");
    console.log("You can now connect MySQL Workbench using:");
    console.log("  - Hostname: 127.0.0.1");
    console.log("  - Port: 3306");
    console.log("  - Database: fincopilot");
    console.log("  - Username: fincopilot_user");
    console.log("  - Password: FinCopilot@2024");
    console.log("==================================================\n");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("[db-setup] Error executing database statements:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

setup();
