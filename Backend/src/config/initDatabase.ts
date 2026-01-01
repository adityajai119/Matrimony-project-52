import pool from './database';

export async function initializeDatabase() {
  try {
    // Create Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        gender VARCHAR(50) NOT NULL,
        height DECIMAL(5,2) NOT NULL,
        weight DECIMAL(5,2) NOT NULL,
        goal ENUM('weight loss', 'muscle gain', 'maintenance') NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'trainer', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to Users if they don't exist (using try-catch for "duplicate column" safety)
    try {
      await pool.execute(`ALTER TABLE Users ADD COLUMN streak_count INT DEFAULT 0`);
    } catch (e: any) { /* ignore duplicate column error */ }

    try {
      await pool.execute(`ALTER TABLE Users ADD COLUMN last_activity_date DATE`);
    } catch (e: any) { /* ignore duplicate column error */ }

    try {
      await pool.execute(`ALTER TABLE Users ADD COLUMN fatigue_level ENUM('Low', 'Medium', 'High') DEFAULT 'Low'`);
    } catch (e: any) { /* ignore duplicate column error */ }

    try {
      await pool.execute(`ALTER TABLE Users ADD COLUMN difficulty_level INT DEFAULT 1`);
    } catch (e: any) { /* ignore duplicate column error */ }

    // === GAMIFICATION COLUMNS ===
    try {
      await pool.execute(`ALTER TABLE Users ADD COLUMN xp_points INT DEFAULT 0`);
    } catch (e: any) { /* ignore */ }

    try {
      await pool.execute(`ALTER TABLE Users ADD COLUMN power_level INT DEFAULT 1`);
    } catch (e: any) { /* ignore */ }

    try {
      await pool.execute(`ALTER TABLE Users ADD COLUMN title VARCHAR(50) DEFAULT 'Rookie'`);
    } catch (e: any) { /* ignore */ }

    try {
      await pool.execute(`ALTER TABLE Users ADD COLUMN water_intake INT DEFAULT 0`);
    } catch (e: any) { /* ignore */ }

    // Create Achievements table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        badge_type VARCHAR(100) NOT NULL,
        badge_name VARCHAR(100) NOT NULL,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_badge (user_id, badge_type)
      )
    `);

    // Create DailyChallenges table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS DailyChallenges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        challenge_date DATE NOT NULL,
        challenge_type VARCHAR(100) NOT NULL,
        challenge_text TEXT NOT NULL,
        xp_reward INT DEFAULT 50,
        completed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_date (user_id, challenge_date)
      )
    `);

    // Create WeightLogs table for body stats tracking
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS WeightLogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        weight DECIMAL(5,2) NOT NULL,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // Create ChatHistory table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ChatHistory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role ENUM('user', 'model') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // Create WorkoutMealPlans table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS WorkoutMealPlans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        day VARCHAR(20) NOT NULL,
        exercises JSON NOT NULL,
        meals JSON NOT NULL,
        completed_status JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_day (user_id, day)
      )
    `);

    // Create ActivityLogs table for GitHub-style graph
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ActivityLogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        activity_type ENUM('workout', 'meal', 'challenge') NOT NULL,
        intensity INT DEFAULT 1,
        logged_at DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_daily_log (user_id, logged_at, activity_type)
      )
    `);

    // Create PendingRegistrations table for OTP storage (production-ready)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS PendingRegistrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        otp VARCHAR(6) NOT NULL,
        registration_data JSON NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error: any) {
    // Don't crash app if MySQL isn't ready yet
    console.error('❌ Database initialization error:', error.message || error);
    console.log('⚠️ App will continue running - tables will be created on first successful connection');
    // DO NOT throw - let app continue running
  }
}

