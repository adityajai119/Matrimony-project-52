CREATE DATABASE smart_fitness;
USE smart_fitness;
CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100),
 age INT,
 gender VARCHAR(10),
 height FLOAT,
 weight FLOAT,
 goal ENUM('weight loss','muscle gain','maintenance'),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE workout_meal_plans (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 day VARCHAR(10),
 exercises JSON,
 meals JSON,
 completed_status JSON,
 FOREIGN KEY (user_id) REFERENCES users(id)
);