import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Railway-hardened MySQL pool configuration
let pool: mysql.Pool;

if (process.env.MYSQL_URL) {
  // Production: Use Railway's MySQL URL with keep-alive
  console.log('🔗 Connecting to Railway MySQL...');
  pool = mysql.createPool({
    uri: process.env.MYSQL_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000,
    // Railway-specific stability settings
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
} else {
  // Local development: Use individual env vars
  console.log('🔗 Connecting to local MySQL...');
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_fitness',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

// Retry wrapper for database queries (handles Railway cold starts)
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  retries: number = 3,
  delay: number = 2000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await queryFn();
    } catch (err: any) {
      lastError = err;
      if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
        console.log(`⏳ DB retry ${attempt}/${retries}...`);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }
      throw err;
    }
  }

  throw lastError || new Error('Database unavailable after retries');
}

export default pool;
