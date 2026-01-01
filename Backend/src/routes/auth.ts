import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool, { executeWithRetry } from '../config/database';
import { RegisterRequest, LoginRequest } from '../types';
import { EmailService } from '../services/emailService';

import admin from '../config/firebase';

const router = express.Router();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Cleanup expired OTPs (runs on each request - database version)
async function cleanupExpiredOTPs() {
  try {
    await pool.execute('DELETE FROM PendingRegistrations WHERE expires_at < NOW()');
  } catch (err) {
    console.error('OTP cleanup error:', err);
  }
}

// ==================== OTP ENDPOINTS ====================

// Send OTP for new user registration
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    await cleanupExpiredOTPs();

    const { name, age, gender, height, weight, goal, email, password, isGoogleUser, googleToken } = req.body;

    // Validation for normal registration
    if (!isGoogleUser) {
      if (!name || !age || !gender || !height || !weight || !goal || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (!['weight loss', 'muscle gain', 'maintenance'].includes(goal)) {
        return res.status(400).json({ error: 'Invalid goal' });
      }
    } else {
      // Google user validation
      if (!email || !age || !gender || !height || !weight || !goal || !googleToken) {
        return res.status(400).json({ error: 'All fields and Google token are required' });
      }
    }

    // Check if email already registered
    const [existingUsers] = await pool.execute(
      'SELECT id FROM Users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store pending registration in database
    const registrationData = JSON.stringify({
      name, age, gender, height, weight, goal, email, password,
      isGoogleUser: isGoogleUser || false,
      googleToken
    });

    // Insert or update pending registration
    await pool.execute(
      `INSERT INTO PendingRegistrations (email, otp, registration_data, expires_at) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE otp = ?, registration_data = ?, expires_at = ?`,
      [email, otp, registrationData, expiresAt, otp, registrationData, expiresAt]
    );

    // Send OTP email
    await EmailService.sendOTP(email, otp);

    res.json({
      message: 'OTP sent successfully',
      email,
      expiresIn: 600 // seconds
    });

  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and complete registration
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Get pending registration from database
    const [pendingRows] = await pool.execute(
      'SELECT * FROM PendingRegistrations WHERE email = ?',
      [email]
    ) as any[];

    if (pendingRows.length === 0) {
      return res.status(400).json({ error: 'No pending registration found. Please register again.' });
    }

    const pending = pendingRows[0];

    if (new Date() > new Date(pending.expires_at)) {
      await pool.execute('DELETE FROM PendingRegistrations WHERE email = ?', [email]);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (pending.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP verified! Complete the registration
    const userData = JSON.parse(pending.registration_data);
    const { isGoogleUser, googleToken } = userData;

    let hashedPassword: string;
    let userName = userData.name;

    if (isGoogleUser && googleToken) {
      // For Google users, verify token and get name
      try {
        const decodedToken = await admin.auth().verifyIdToken(googleToken);
        userName = decodedToken.name || userData.name || 'Warrior';
        hashedPassword = await bcrypt.hash(decodedToken.uid + Date.now(), 10);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid Google token' });
      }
    } else {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO Users (name, age, gender, height, weight, goal, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userName, userData.age, userData.gender, userData.height, userData.weight, userData.goal, userData.email, hashedPassword]
    ) as any[];

    const userId = result.insertId;

    // Seed empty plans
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const emptyExercises = JSON.stringify([]);
    const defaultMeal = { name: "No meal planned", calories: 0, description: "Use AI to generate a plan" };
    const emptyMeals = JSON.stringify({ breakfast: defaultMeal, lunch: defaultMeal, dinner: defaultMeal, snacks: [], totalCalories: 0 });
    const emptyStatus = JSON.stringify({ exercises: {}, meals: { breakfast: false, lunch: false, dinner: false, snacks: {} } });

    for (const day of days) {
      await pool.execute(
        'INSERT INTO WorkoutMealPlans (user_id, day, exercises, meals, completed_status) VALUES (?, ?, ?, ?, ?)',
        [userId, day, emptyExercises, emptyMeals, emptyStatus]
      );
    }

    // Remove from pending registrations
    await pool.execute('DELETE FROM PendingRegistrations WHERE email = ?', [email]);

    // Generate JWT
    const token = jwt.sign(
      { userId, email: userData.email, role: 'user' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, name: userName, email: userData.email, goal: userData.goal }
    });

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if there's a pending registration
    const [pendingRows] = await pool.execute(
      'SELECT * FROM PendingRegistrations WHERE email = ?',
      [email]
    ) as any[];

    if (pendingRows.length === 0) {
      return res.status(400).json({ error: 'No pending registration found' });
    }

    // Generate new OTP
    const newOtp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update OTP in database
    await pool.execute(
      'UPDATE PendingRegistrations SET otp = ?, expires_at = ? WHERE email = ?',
      [newOtp, expiresAt, email]
    );

    // Send new OTP
    await EmailService.sendOTP(email, newOtp);

    res.json({ message: 'New OTP sent successfully' });

  } catch (error: any) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// ==================== EXISTING ENDPOINTS ====================

// Google Login
router.post('/google-login', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name, picture, uid } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: 'Email is required from Google' });
    }

    // Check if user exists (with retry for Railway cold starts)
    const [users] = await executeWithRetry(() =>
      pool.execute('SELECT * FROM Users WHERE email = ?', [email])
    ) as any[];



    if (users.length === 0) {
      return res.status(200).json({
        isNewUser: true,
        token,
        user: { name, email, picture }
      });
    }

    const user = users[0];

    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Invalid token or server error' });
  }
});

// Google Register
router.post('/google-register', async (req: Request, res: Response) => {
  try {
    const { token, age, gender, height, weight, goal }: any = req.body;

    if (!token || !age || !gender || !height || !weight || !goal) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name, uid } = decodedToken;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM Users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already registered' });
    }

    // Create User
    const defaultPassword = await bcrypt.hash(uid + Date.now(), 10);

    const [result] = await pool.execute(
      'INSERT INTO Users (name, age, gender, height, weight, goal, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name || 'Warrior', age, gender, height, weight, goal, email, defaultPassword]
    ) as any[];

    const userId = result.insertId;

    // Seed empty data
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const emptyExercises = JSON.stringify([]);
    const defaultMeal = { name: "No meal planned", calories: 0, description: "Use AI to generate a plan" };
    const emptyMeals = JSON.stringify({ breakfast: defaultMeal, lunch: defaultMeal, dinner: defaultMeal, snacks: [], totalCalories: 0 });
    const emptyStatus = JSON.stringify({ exercises: {}, meals: { breakfast: false, lunch: false, dinner: false, snacks: {} } });

    for (const day of days) {
      await pool.execute(
        'INSERT INTO WorkoutMealPlans (user_id, day, exercises, meals, completed_status) VALUES (?, ?, ?, ?, ?)',
        [userId, day, emptyExercises, emptyMeals, emptyStatus]
      );
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { userId, email, role: 'user' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token: jwtToken,
      user: { id: userId, name, email, goal }
    });

  } catch (error: any) {
    console.error('Google register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, age, gender, height, weight, goal, email, password }: RegisterRequest = req.body;

    // Validation
    if (!name || !age || !gender || !height || !weight || !goal || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['weight loss', 'muscle gain', 'maintenance'].includes(goal)) {
      return res.status(400).json({ error: 'Invalid goal. Must be: weight loss, muscle gain, or maintenance' });
    }

    if (age < 1 || age > 120) {
      return res.status(400).json({ error: 'Age must be between 1 and 120' });
    }

    if (height < 1 || height > 300) {
      return res.status(400).json({ error: 'Height must be between 1 and 300 cm' });
    }

    if (weight < 1 || weight > 500) {
      return res.status(400).json({ error: 'Weight must be between 1 and 500 kg' });
    }

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM Users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO Users (name, age, gender, height, weight, goal, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, age, gender, height, weight, goal, email, hashedPassword]
    ) as any[];

    const userId = result.insertId;

    // Seed empty plans for the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const emptyExercises = JSON.stringify([]);
    const defaultMeal = { name: "No meal planned", calories: 0, description: "Use AI to generate a plan" };
    const emptyMeals = JSON.stringify({
      breakfast: defaultMeal,
      lunch: defaultMeal,
      dinner: defaultMeal,
      snacks: [],
      totalCalories: 0
    });
    const emptyStatus = JSON.stringify({ exercises: {}, meals: { breakfast: false, lunch: false, dinner: false, snacks: {} } });

    for (const day of days) {
      await pool.execute(
        'INSERT INTO WorkoutMealPlans (user_id, day, exercises, meals, completed_status) VALUES (?, ?, ?, ?, ?)',
        [userId, day, emptyExercises, emptyMeals, emptyStatus]
      );
    }

    // Generate token
    const token = jwt.sign(
      { userId, email, role: 'user' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name,
        email,
        goal
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    ) as any[];

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

