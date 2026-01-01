import express, { Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generateWorkoutForGoal } from '../utils/workoutGenerator';
import { generateMealPlanForGoal } from '../utils/mealGenerator';
import { LogicEngine } from '../services/logicEngine';

const router = express.Router();

// Get all workout plans for the week
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Use CASE for ordering instead of FIELD() for better compatibility
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

    // If no plans exist, generate them
    if (plans.length === 0) {
      // Get user goal
      const [users] = await pool.execute(
        'SELECT goal FROM Users WHERE id = ?',
        [userId]
      ) as any[];

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const goal = users[0].goal;
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      for (const day of days) {
        const exercises = generateWorkoutForGoal(goal, day);
        const meals = generateMealPlanForGoal(goal, day);
        const completedStatus: any = {
          exercises: {} as { [key: string]: boolean },
          meals: { breakfast: false, lunch: false, dinner: false, snacks: {} as { [key: string]: boolean } }
        };

        exercises.forEach((_, index) => {
          completedStatus.exercises[index.toString()] = false;
        });

        meals.snacks.forEach((_, index) => {
          completedStatus.meals.snacks[index.toString()] = false;
        });

        await pool.execute(
          'INSERT INTO WorkoutMealPlans (user_id, day, exercises, meals, completed_status) VALUES (?, ?, ?, ?, ?)',
          [
            userId,
            day,
            JSON.stringify(exercises),
            JSON.stringify(meals),
            JSON.stringify(completedStatus)
          ]
        );
      }

      // Fetch the newly created plans
      const [newPlans] = await pool.execute(
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

      const formattedPlans = newPlans.map((plan: any) => ({
        ...plan,
        exercises: typeof plan.exercises === 'string' ? JSON.parse(plan.exercises) : plan.exercises,
        meals: typeof plan.meals === 'string' ? JSON.parse(plan.meals) : plan.meals,
        completed_status: typeof plan.completed_status === 'string' ? JSON.parse(plan.completed_status) : plan.completed_status
      }));

      return res.json(formattedPlans);
    }

    // Format existing plans
    // MySQL JSON columns are already parsed by mysql2, so check if it's already an object
    const formattedPlans = plans.map((plan: any) => ({
      ...plan,
      exercises: typeof plan.exercises === 'string' ? JSON.parse(plan.exercises) : plan.exercises,
      meals: typeof plan.meals === 'string' ? JSON.parse(plan.meals) : plan.meals,
      completed_status: typeof plan.completed_status === 'string' ? JSON.parse(plan.completed_status) : plan.completed_status
    }));

    res.json(formattedPlans);
  } catch (error: any) {
    console.error('Get workouts error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get workout for a specific day
router.get('/:day', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const day = req.params.day;

    const [plans] = await pool.execute(
      'SELECT * FROM WorkoutMealPlans WHERE user_id = ? AND day = ?',
      [userId, day]
    ) as any[];

    if (plans.length === 0) {
      return res.status(404).json({ error: 'Workout plan not found for this day' });
    }

    const plan = plans[0];
    res.json({
      ...plan,
      exercises: typeof plan.exercises === 'string' ? JSON.parse(plan.exercises) : plan.exercises,
      meals: typeof plan.meals === 'string' ? JSON.parse(plan.meals) : plan.meals,
      completed_status: typeof plan.completed_status === 'string' ? JSON.parse(plan.completed_status) : plan.completed_status
    });
  } catch (error: any) {
    console.error('Get workout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark exercise as completed
router.patch('/:day/exercises/:exerciseIndex', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const day = req.params.day;
    const exerciseIndex = parseInt(req.params.exerciseIndex);
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed status must be a boolean' });
    }

    const [plans] = await pool.execute(
      'SELECT * FROM WorkoutMealPlans WHERE user_id = ? AND day = ?',
      [userId, day]
    ) as any[];

    if (plans.length === 0) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }

    const plan = plans[0];
    const completedStatus = typeof plan.completed_status === 'string' ? JSON.parse(plan.completed_status) : plan.completed_status;
    completedStatus.exercises[exerciseIndex.toString()] = completed;

    await pool.execute(
      'UPDATE WorkoutMealPlans SET completed_status = ? WHERE user_id = ? AND day = ?',
      [JSON.stringify(completedStatus), userId, day]
    );

    // Log Activity if completed
    if (completed) {
      await LogicEngine.logActivity(userId, 'workout', 1);
    }

    res.json({ message: 'Exercise status updated', completed_status: completedStatus });
  } catch (error: any) {
    console.error('Update exercise status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update workout exercises for a specific day
router.put('/:day', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const day = req.params.day;
    const { exercises } = req.body;

    if (!exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Exercises array is required' });
    }

    // Check if workout exists
    const [plans] = await pool.execute(
      'SELECT * FROM WorkoutMealPlans WHERE user_id = ? AND day = ?',
      [userId, day]
    ) as any[];

    if (plans.length === 0) {
      return res.status(404).json({ error: 'Workout plan not found for this day' });
    }

    // Reset completed status for new exercises
    const completedStatus: any = {
      exercises: {} as { [key: string]: boolean },
      meals: plans[0].completed_status?.meals || { breakfast: false, lunch: false, dinner: false, snacks: {} }
    };

    exercises.forEach((_: any, index: number) => {
      completedStatus.exercises[index.toString()] = false;
    });

    // Update the workout
    await pool.execute(
      'UPDATE WorkoutMealPlans SET exercises = ?, completed_status = ? WHERE user_id = ? AND day = ?',
      [JSON.stringify(exercises), JSON.stringify(completedStatus), userId, day]
    );

    res.json({
      message: 'Workout updated successfully',
      exercises,
      completed_status: completedStatus
    });
  } catch (error: any) {
    console.error('Update workout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
