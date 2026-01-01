import express, { Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get progress data
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get all workout/meal plans
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
      return res.json({
        weeklyStats: {
          exercisesCompleted: 0,
          totalExercises: 0,
          mealsCompleted: 0,
          totalMeals: 0,
          caloriesConsumed: 0,
          caloriesTarget: 0
        },
        dailyStats: []
      });
    }

    // Calculate weekly stats
    let exercisesCompleted = 0;
    let totalExercises = 0;
    let mealsCompleted = 0;
    let totalMeals = 0;
    let caloriesConsumed = 0;
    let caloriesTarget = 0;

    const dailyStats: any[] = [];

    plans.forEach((plan: any) => {
      const exercises = typeof plan.exercises === 'string' ? JSON.parse(plan.exercises) : plan.exercises;
      const meals = typeof plan.meals === 'string' ? JSON.parse(plan.meals) : plan.meals;
      const completedStatus = typeof plan.completed_status === 'string' ? JSON.parse(plan.completed_status) : plan.completed_status;

      totalExercises += exercises.length;
      Object.values(completedStatus.exercises).forEach((completed: any) => {
        if (completed) exercisesCompleted++;
      });

      // Count meals
      const mealTypes = ['breakfast', 'lunch', 'dinner'];
      totalMeals += mealTypes.length;
      mealTypes.forEach((mealType) => {
        if (completedStatus.meals[mealType]) {
          mealsCompleted++;
          if (mealType === 'breakfast') caloriesConsumed += meals.breakfast.calories;
          if (mealType === 'lunch') caloriesConsumed += meals.lunch.calories;
          if (mealType === 'dinner') caloriesConsumed += meals.dinner.calories;
        }
      });

      // Count snacks
      if (meals.snacks && Array.isArray(meals.snacks)) {
        totalMeals += meals.snacks.length;
        if (completedStatus.meals.snacks) {
          Object.keys(completedStatus.meals.snacks).forEach((index) => {
            if (completedStatus.meals.snacks[index]) {
              mealsCompleted++;
              caloriesConsumed += meals.snacks[parseInt(index)].calories;
            }
          });
        }
      }

      caloriesTarget += meals.totalCalories;

      // Daily stats
      const dayExercisesCompleted = Object.values(completedStatus.exercises).filter((c: any) => c).length;
      const dayMealsCompleted = mealTypes.filter(m => completedStatus.meals[m]).length +
        (completedStatus.meals.snacks ? Object.values(completedStatus.meals.snacks).filter((c: any) => c).length : 0);
      const dayCaloriesConsumed = (completedStatus.meals.breakfast ? meals.breakfast.calories : 0) +
        (completedStatus.meals.lunch ? meals.lunch.calories : 0) +
        (completedStatus.meals.dinner ? meals.dinner.calories : 0) +
        (completedStatus.meals.snacks ? Object.keys(completedStatus.meals.snacks)
          .filter(i => completedStatus.meals.snacks[i])
          .reduce((sum, i) => sum + meals.snacks[parseInt(i)].calories, 0) : 0);

      dailyStats.push({
        day: plan.day,
        exercisesCompleted: dayExercisesCompleted,
        totalExercises: exercises.length,
        mealsCompleted: dayMealsCompleted,
        totalMeals: mealTypes.length + (meals.snacks?.length || 0),
        caloriesConsumed: dayCaloriesConsumed,
        caloriesTarget: meals.totalCalories
      });
    });

    res.json({
      weeklyStats: {
        exercisesCompleted,
        totalExercises,
        mealsCompleted,
        totalMeals,
        caloriesConsumed,
        caloriesTarget
      },
      dailyStats
    });
  } catch (error: any) {
    console.error('Get progress error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

