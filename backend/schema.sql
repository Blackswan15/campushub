CREATE DATABASE IF NOT EXISTS campushub;
USE campushub;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255),
  role ENUM('admin', 'organizer', 'student', 'pending_org') NOT NULL DEFAULT 'student',
  google_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS clubs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by INT,
  approved BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  date DATETIME NOT NULL,
  venue VARCHAR(200) NOT NULL,
  created_by INT,
  type ENUM('club', 'department') NOT NULL,
  ref_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sub_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50),
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sub_event_id INT NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_registration (user_id, sub_event_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sub_event_id) REFERENCES sub_events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookmarks (
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);


INSERT IGNORE INTO users (name, email, password, role) VALUES
('Super Admin', 'admin@campushub.com', '$2b$10$UmRvIh0ezmSjsFxTCHFsZUE.5hISNK1A2fDehP6JKH', 'admin');


INSERT IGNORE INTO departments (name) VALUES
('Computer Science & Engineering'),
('Electrical & Electronics Engineering'),
('Mechanical Engineering'),
('Civil Engineering'),
('Information Technology'),
('Electronics & Communication Engineering'),
('Business Administration'),
('Arts & Science');
