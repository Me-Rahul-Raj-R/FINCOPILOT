-- FinCopilot Database Setup
-- Run this as MySQL root user

CREATE DATABASE IF NOT EXISTS fincopilot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'fincopilot_user'@'localhost'
  IDENTIFIED BY 'FinCopilot@2024';

GRANT ALL PRIVILEGES ON fincopilot.* TO 'fincopilot_user'@'localhost';

FLUSH PRIVILEGES;

SELECT 'SUCCESS: fincopilot database and fincopilot_user created!' AS result;
