import express, { Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all meal plans for the week
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const [plans] = await pool.execute(
      `SELECT * FROM WorkoutMealPlans WHERE user_id = ? 
       ORDER BY CASE day
         WHEN 'Monday' THEN 1
         WHEN 'Tuesday' THEN 2
         WHEN 'Wednesday' THEN 3
         WHEN 'Thursday' THEN 4
         WHEN 'Friday' THEN 5
         WHEN 'Saturday' THEN 6
         WHEN 'Sunday' THEN 7
         ELSE 8
       END`,
      [userId]
    ) as any[];

    if (plans.length === 0) {
      return res.status(404).json({ error: 'Meal plans not found. Please update your profile first.' });
    }

    const formattedPlans = plans.map((plan: any) => ({
      ...plan,
      exercises: typeof plan.exercises === 'string' ? JSON.parse(plan.exercises) : plan.exercises,
      meals: typeof plan.meals === 'string' ? JSON.parse(plan.meals) : plan.meals,
      completed_status: typeof plan.completed_status === 'string' ? JSON.parse(plan.completed_status) : plan.completed_status
    }));

    res.json(formattedPlans);
  } catch (error: any) {
    console.error('Get meals error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get meal plan for a specific day
router.get('/:day', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const day = req.params.day;

    const [plans] = await pool.execute(
      'SELECT * FROM WorkoutMealPlans WHERE user_id = ? AND day = ?',
      [userId, day]
    ) as any[];

    if (plans.length === 0) {
      return res.status(404).json({ error: 'Meal plan not found for this day' });
    }

    const plan = plans[0];
    res.json({
      ...plan,
      exercises: typeof plan.exercises === 'string' ? JSON.parse(plan.exercises) : plan.exercises,
      meals: typeof plan.meals === 'string' ? JSON.parse(plan.meals) : plan.meals,
      completed_status: typeof plan.completed_status === 'string' ? JSON.parse(plan.completed_status) : plan.completed_status
    });
  } catch (error: any) {
    console.error('Get meal plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark meal as consumed
router.patch('/:day/meals/:mealType', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const day = req.params.day;
    const mealType = req.params.mealType; // breakfast, lunch, dinner, or snack index
    const { completed, snackIndex } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed status must be a boolean' });
    }

    const [plans] = await pool.execute(
      'SELECT * FROM WorkoutMealPlans WHERE user_id = ? AND day = ?',
      [userId, day]
    ) as any[];

    if (plans.length === 0) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    const plan = plans[0];
    const completedStatus = typeof plan.completed_status === 'string' ? JSON.parse(plan.completed_status) : plan.completed_status;

    if (mealType === 'snack') {
      if (snackIndex === undefined) {
        return res.status(400).json({ error: 'snackIndex is required for snack meals' });
      }
      if (!completedStatus.meals.snacks) {
        completedStatus.meals.snacks = {};
      }
      completedStatus.meals.snacks[snackIndex.toString()] = completed;
    } else {
      completedStatus.meals[mealType] = completed;
    }

    await pool.execute(
      'UPDATE WorkoutMealPlans SET completed_status = ? WHERE user_id = ? AND day = ?',
      [JSON.stringify(completedStatus), userId, day]
    );

    res.json({ message: 'Meal status updated', completed_status: completedStatus });
  } catch (error: any) {
    console.error('Update meal status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

