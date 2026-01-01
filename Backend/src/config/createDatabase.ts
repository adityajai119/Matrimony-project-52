import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  // Skip database creation in production (Railway creates DB automatically)
  if (process.env.MYSQL_URL || process.env.NODE_ENV === 'production') {
    console.log('✅ Using Railway MySQL - database already exists');
    return;
  }

  try {
    // Connect without specifying database (local dev only)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'smart_fitness'}`);
    console.log(`Database '${process.env.DB_NAME || 'smart_fitness'}' created or already exists`);

    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createDatabase().then(() => {
    console.log('Database setup complete');
    process.exit(0);
  }).catch((error) => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });
}

export default createDatabase;
