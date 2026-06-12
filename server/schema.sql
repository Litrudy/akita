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

-- phase 2: trilingual news + admin accounts ---------------------------------

CREATE TABLE IF NOT EXISTS news (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(120)  NOT NULL UNIQUE,
  position     INT           NOT NULL DEFAULT 0,
  status       ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  meta_label   VARCHAR(160)  NOT NULL DEFAULT '',
  category_en  VARCHAR(120)  NOT NULL DEFAULT '',
  category_fr  VARCHAR(120)  NOT NULL DEFAULT '',
  category_zh  VARCHAR(120)  NOT NULL DEFAULT '',
  title_en     VARCHAR(255)  NOT NULL DEFAULT '',
  title_fr     VARCHAR(255)  NOT NULL DEFAULT '',
  title_zh     VARCHAR(255)  NOT NULL DEFAULT '',
  subtitle_en  VARCHAR(255)  NOT NULL DEFAULT '',
  subtitle_fr  VARCHAR(255)  NOT NULL DEFAULT '',
  subtitle_zh  VARCHAR(255)  NOT NULL DEFAULT '',
  body_en      MEDIUMTEXT    NULL,
  body_fr      MEDIUMTEXT    NULL,
  body_zh      MEDIUMTEXT    NULL,
  -- facts: one per line, six " | "-separated segments:
  -- value_en | value_fr | value_zh | label_en | label_fr | label_zh
  facts        TEXT          NULL,
  published_at DATETIME      NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_pos (status, position, id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(60)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;
