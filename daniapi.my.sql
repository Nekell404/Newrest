CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  account_type VARCHAR(20) DEFAULT 'Free',
  api_key VARCHAR(255) NOT NULL,
  edit_api_key_count INT DEFAULT 0,
  usage_limit INT DEFAULT 100,
  last_updated_date DATETIME,
  expired_date DATETIME,
  otp VARCHAR(6),
  otp_verified TINYINT(1) DEFAULT 0,
  reset_token VARCHAR(255),
  token_expiry DATETIME,
  reset_token_expiration DATETIME
);

CREATE TABLE ip_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  sign_up_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_ip_address (ip_address)
);

CREATE TABLE visitors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  visits INT DEFAULT 0,
  last_visited DATETIME,
  CONSTRAINT unique_username UNIQUE (username)
);

CREATE TABLE request_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  api_key VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  daily_requests INT DEFAULT 0,
  total_requests INT DEFAULT 0
);