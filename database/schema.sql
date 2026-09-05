-- ==========================================================
-- HOSTEL MAP — Database Schema (MySQL 8.0+)
-- ==========================================================

DROP TABLE IF EXISTS review_reports;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS food_updates;
DROP TABLE IF EXISTS hostel_facilities;
DROP TABLE IF EXISTS facilities;
DROP TABLE IF EXISTS hostels;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'ADMIN', 'HOSTEL_OWNER') NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Hostels Table
CREATE TABLE hostels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    area VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Telangana',
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    hostel_type ENUM('BOYS', 'GIRLS', 'CO_LIVING') NOT NULL DEFAULT 'CO_LIVING',
    monthly_rent DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    deposit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    food_available BOOLEAN NOT NULL DEFAULT TRUE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('ACTIVE', 'INACTIVE', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hostels_area (area),
    INDEX idx_hostels_city (city),
    INDEX idx_hostels_type (hostel_type),
    INDEX idx_hostels_lat_lng (latitude, longitude),
    INDEX idx_hostels_rent (monthly_rent),
    INDEX idx_hostels_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Facilities Table
CREATE TABLE facilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Hostel Facilities (Many-to-Many join table)
CREATE TABLE hostel_facilities (
    hostel_id BIGINT NOT NULL,
    facility_id BIGINT NOT NULL,
    PRIMARY KEY (hostel_id, facility_id),
    CONSTRAINT fk_hf_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
    CONSTRAINT fk_hf_facility FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Reviews Table
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hostel_id BIGINT NOT NULL,
    user_id BIGINT,
    food_rating DECIMAL(2, 1) NOT NULL CHECK (food_rating >= 1.0 AND food_rating <= 5.0),
    cleanliness_rating DECIMAL(2, 1) NOT NULL CHECK (cleanliness_rating >= 1.0 AND cleanliness_rating <= 5.0),
    safety_rating DECIMAL(2, 1) NOT NULL CHECK (safety_rating >= 1.0 AND safety_rating <= 5.0),
    wifi_rating DECIMAL(2, 1) NOT NULL CHECK (wifi_rating >= 1.0 AND wifi_rating <= 5.0),
    management_rating DECIMAL(2, 1) NOT NULL CHECK (management_rating >= 1.0 AND management_rating <= 5.0),
    value_rating DECIMAL(2, 1) NOT NULL CHECK (value_rating >= 1.0 AND value_rating <= 5.0),
    comment TEXT,
    recommend BOOLEAN NOT NULL DEFAULT TRUE,
    verified_student BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reviews_hostel (hostel_id),
    INDEX idx_reviews_status (status),
    INDEX idx_reviews_created (created_at),
    CONSTRAINT fk_reviews_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Food Updates Table (Daily Food System)
CREATE TABLE food_updates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hostel_id BIGINT NOT NULL,
    food_date DATE NOT NULL,
    breakfast VARCHAR(255) NOT NULL,
    lunch VARCHAR(255) NOT NULL,
    dinner VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_hostel_food_date (hostel_id, food_date),
    INDEX idx_food_hostel (hostel_id),
    INDEX idx_food_date (food_date),
    CONSTRAINT fk_food_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Review Reports Table
CREATE TABLE review_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    reported_by VARCHAR(100),
    reason VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reports_review (review_id),
    INDEX idx_reports_status (status),
    CONSTRAINT fk_reports_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
