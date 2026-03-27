-- MySQL schema for Namaste Bharat migration
-- Target: Hostinger MySQL 8+

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  full_name VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified_at DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  full_name VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user
    FOREIGN KEY (id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
  token CHAR(64) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  CONSTRAINT fk_user_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  KEY idx_user_sessions_user_id (user_id),
  KEY idx_user_sessions_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS phone_otps (
  id CHAR(36) NOT NULL PRIMARY KEY,
  phone VARCHAR(30) NOT NULL,
  otp_hash TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_phone_otps_phone_created (phone, created_at),
  KEY idx_phone_otps_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS businesses (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  tagline TEXT NULL,
  description LONGTEXT NULL,
  locality VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  address_line_1 TEXT NULL,
  address_line_2 TEXT NULL,
  pincode VARCHAR(20) NULL,
  owner_name VARCHAR(255) NULL,
  established_year INT NULL,
  email VARCHAR(255) NULL,
  website VARCHAR(500) NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  review_count INT NOT NULL DEFAULT 0,
  is_open_now TINYINT(1) NOT NULL DEFAULT 0,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  listing_status ENUM('pending', 'active', 'rejected') NOT NULL DEFAULT 'pending',
  activated_at DATETIME NULL,
  rejected_reason TEXT NULL,
  phone VARCHAR(30) NOT NULL,
  whatsapp_number VARCHAR(30) NOT NULL,
  service_areas JSON NOT NULL,
  languages JSON NOT NULL,
  keywords JSON NOT NULL,
  highlights JSON NOT NULL,
  services JSON NOT NULL,
  business_hours JSON NOT NULL,
  media JSON NOT NULL,
  faqs JSON NOT NULL,
  policies JSON NOT NULL,
  social_links JSON NOT NULL,
  verification JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_businesses_city (city),
  KEY idx_businesses_category (category),
  KEY idx_businesses_rating (rating),
  KEY idx_businesses_review_count (review_count),
  KEY idx_businesses_listing_status (listing_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reels (
  id CHAR(36) NOT NULL PRIMARY KEY,
  business_id CHAR(36) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  handle VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  city VARCHAR(255) NOT NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reels_business
    FOREIGN KEY (business_id) REFERENCES businesses(id)
    ON DELETE CASCADE,
  KEY idx_reels_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS offers (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT NOT NULL,
  badge VARCHAR(100) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_offers_active (active),
  KEY idx_offers_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id CHAR(36) NOT NULL PRIMARY KEY,
  business_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  message TEXT NOT NULL,
  source ENUM('search', 'reel', 'profile') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_leads_business
    FOREIGN KEY (business_id) REFERENCES businesses(id)
    ON DELETE CASCADE,
  KEY idx_leads_business_id (business_id),
  KEY idx_leads_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) NOT NULL PRIMARY KEY,
  business_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  reviewer_name VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
  rating DECIMAL(2,1) NOT NULL,
  comment TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_business
    FOREIGN KEY (business_id) REFERENCES businesses(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  KEY idx_reviews_business_id (business_id),
  KEY idx_reviews_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS daily_inquiry_posts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  inquiry_date DATE NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_daily_inquiry_posts_inquiry_date (inquiry_date),
  KEY idx_daily_inquiry_posts_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS listing_plans (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price_label VARCHAR(255) NOT NULL,
  short_label VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  features JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
