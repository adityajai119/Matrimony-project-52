import express, { Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generateWorkoutForGoal } from '../utils/workoutGenerator';
import { generateMealPlanForGoal } from '../utils/mealGenerator';
import { EmailService } from '../services/emailService';

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const [users] = await pool.execute(
      'SELECT id, name, age, gender, height, weight, goal, email, role, created_at, streak_count, fatigue_level, last_activity_date FROM Users WHERE id = ?',
      [userId]
    ) as any[];

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Real-time streak validation: Check if user missed any days
    let streakCount = user.streak_count || 0;
    const lastActivityDate = user.last_activity_date ? new Date(user.last_activity_date) : null;

    if (lastActivityDate && streakCount > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDate = new Date(lastActivityDate);
      lastDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // If more than 1 day has passed, reset streak
      if (diffDays > 1) {
        streakCount = 0;
        await pool.execute(
          'UPDATE Users SET streak_count = 0 WHERE id = ?',
          [userId]
        );
      }
    }

    // Return user with validated streak
    res.json({
      ...user,
      streak_count: streakCount
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, age, gender, height, weight, goal } = req.body;

    // Validation
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    if (age !== undefined && (age < 1 || age > 120)) {
      return res.status(400).json({ error: 'Age must be between 1 and 120' });
    }

    if (height !== undefined && (height < 1 || height > 300)) {
      return res.status(400).json({ error: 'Height must be between 1 and 300 cm' });
    }

    if (weight !== undefined && (weight < 1 || weight > 500)) {
      return res.status(400).json({ error: 'Weight must be between 1 and 500 kg' });
    }

    if (goal !== undefined && !['weight loss', 'muscle gain', 'maintenance'].includes(goal)) {
      return res.status(400).json({ error: 'Invalid goal. Must be: weight loss, muscle gain, or maintenance' });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (age !== undefined) {
      updates.push('age = ?');
      values.push(age);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      values.push(gender);
    }
    if (height !== undefined) {
      updates.push('height = ?');
      values.push(height);
    }
    if (weight !== undefined) {
      updates.push('weight = ?');
      values.push(weight);
    }
    if (goal !== undefined) {
      updates.push('goal = ?');
      values.push(goal);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    await pool.execute(
      `UPDATE Users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // If goal changed, regenerate workout and meal plans
    if (goal !== undefined) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      for (const day of days) {
        const exercises = generateWorkoutForGoal(goal, day);
        const meals = generateMealPlanForGoal(goal, day);
        const completedStatus: any = {
          exercises: {} as { [key: string]: boolean },
          meals: { breakfast: false, lunch: false, dinner: false, snacks: {} as { [key: string]: boolean } }
        };

        // Initialize completed status for exercises
        exercises.forEach((_, index) => {
          completedStatus.exercises[index.toString()] = false;
        });

        // Initialize completed status for snacks
        meals.snacks.forEach((_, index) => {
          completedStatus.meals.snacks[index.toString()] = false;
        });

        await pool.execute(
          `INSERT INTO WorkoutMealPlans (user_id, day, exercises, meals, completed_status)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE exercises = ?, meals = ?, completed_status = ?`,
          [
            userId,
            day,
            JSON.stringify(exercises),
            JSON.stringify(meals),
            JSON.stringify(completedStatus),
            JSON.stringify(exercises),
            JSON.stringify(meals),
            JSON.stringify(completedStatus)
          ]
        );
      }
    }

    // Get updated user
    const [users] = await pool.execute(
      'SELECT id, name, age, gender, height, weight, goal, email, role, created_at FROM Users WHERE id = ?',
      [userId]
    ) as any[];

    res.json(users[0]);
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Activity Logs for Graph
router.get('/activity-log', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Fetch last 365 days of activity
    const [rows] = await pool.execute(`
      SELECT logged_at, activity_type, intensity 
      FROM ActivityLogs 
      WHERE user_id = ? 
      AND logged_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
      ORDER BY logged_at ASC
    `, [userId]);

    res.json(rows);
  } catch (error: any) {
    console.error('Get activity log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send Progress Email
router.post('/email-progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Fetch User Profile
    const [users] = await pool.execute(
      'SELECT name, email, streak_count, weight, height, power_level, title FROM Users WHERE id = ?',
      [userId]
    ) as any[];

    if (!users.length) return res.status(404).json({ error: 'User not found' });
    const user = users[0];

    // Fetch Today's Workout
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    const [plans] = await pool.execute(
      'SELECT exercises FROM WorkoutMealPlans WHERE user_id = ? AND day = ?',
      [userId, today]
    ) as any[];

    let todaysWorkout = null;
    if (plans.length > 0) {
      todaysWorkout = typeof plans[0].exercises === 'string' ? JSON.parse(plans[0].exercises) : plans[0].exercises;
    }

    // Calculate BMI
    const heightInM = user.height / 100;
    const bmi = (user.weight / (heightInM * heightInM)).toFixed(1);
    let bmiStatus = 'Normal';
    if (Number(bmi) < 18.5) bmiStatus = 'Underweight';
    else if (Number(bmi) >= 25 && Number(bmi) < 30) bmiStatus = 'Overweight';
    else if (Number(bmi) >= 30) bmiStatus = 'Obese';

    // Prepare Data
    const emailData = {
      powerLevel: user.power_level || 1,
      title: user.title || 'Rookie',
      streak: user.streak_count || 0,
      bmi: bmi,
      bmiStatus: bmiStatus,
      todaysWorkout: todaysWorkout
    };

    // Send Email
    await EmailService.sendProgressReport(user.email, user.name, emailData);

    res.json({ message: 'Email sent successfully' });

  } catch (error: any) {
    console.error('Email progress error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

