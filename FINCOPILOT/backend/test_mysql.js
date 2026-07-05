const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("fincopilot", "fincopilot_user", "FinCopilot@2024", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: console.log,
});

async function test() {
  try {
    await sequelize.authenticate();
    console.log("SUCCESS: Connected to MySQL!");
    process.exit(0);
  } catch (err) {
    console.error("FAILED to connect to MySQL:", err.message);
    process.exit(1);
  }
}

test();
