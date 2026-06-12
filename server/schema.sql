-- Akita website database — phase 1
CREATE DATABASE IF NOT EXISTS akita_site
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE akita_site;

CREATE TABLE IF NOT EXISTS enquiries (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kind        ENUM('quote', 'tracking') NOT NULL DEFAULT 'quote',
  name        VARCHAR(120)  NOT NULL DEFAULT '',
  company     VARCHAR(160)  NOT NULL DEFAULT '',
  email       VARCHAR(190)  NOT NULL DEFAULT '',
  phone       VARCHAR(60)   NOT NULL DEFAULT '',
  origin      VARCHAR(160)  NOT NULL DEFAULT '',
  destination VARCHAR(160)  NOT NULL DEFAULT '',
  service     VARCHAR(120)  NOT NULL DEFAULT '',
  reference   VARCHAR(160)  NOT NULL DEFAULT '',
  message     TEXT          NULL,
  lang        VARCHAR(8)    NOT NULL DEFAULT 'en',
  ip          VARCHAR(64)   NOT NULL DEFAULT '',
  user_agent  VARCHAR(255)  NOT NULL DEFAULT '',
  email_sent  TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at),
  INDEX idx_kind (kind)
) ENGINE = InnoDB;
