import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export class LogicEngine {

    // Update streak logic
    static async updateStreak(userId: number): Promise<number> {
        // This logic assumes we call this when a user completes a workout or logs a meal
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT streak_count, last_activity_date FROM Users WHERE id = ?',
            [userId]
        );

        if (!rows.length) return 0;
        const user = rows[0];
        const today = new Date();
        const lastDate = user.last_activity_date ? new Date(user.last_activity_date) : null;

        let newStreak = user.streak_count;

        if (lastDate) {
            const diffTime = Math.abs(today.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                newStreak++;
            } else if (diffDays > 1) {
                // Missed a day or more
                newStreak = 1; // Reset to 1 since they are active today
            }
            // If diffDays is 0 (same day), do nothing
        } else {
            // First activity
            newStreak = 1;
        }

        await pool.execute(
            'UPDATE Users SET streak_count = ?, last_activity_date = NOW() WHERE id = ?',
            [newStreak, userId]
        );

        return newStreak;
    }

    // Generate Grocery List from Meal Plan
    static async generateGroceryList(userId: number, day: string): Promise<string> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT meals FROM WorkoutMealPlans WHERE user_id = ? AND day = ?',
            [userId, day]
        );

        if (!rows.length) return 'No meal plan found for this day.';

        const meals = rows[0].meals; // JSON object
        if (typeof meals === 'string') {
            // handle stringified JSON if needed, though mysql2 usually parses it
        }

        // In a real app with structured ingredients, we would parse them. 
        // Since our AI returns "description" texts, we'll extract keywords or return a summary.
        // For this demo, we'll format the meal descriptions into a list.

        let list = `Grocery List for ${day}\n\n`;
        ['breakfast', 'lunch', 'dinner'].forEach(type => {
            if (meals[type]) {
                list += `[${type.toUpperCase()}] ${meals[type].name}\n`;
                // Simple heuristic to grab ingredients from description (not perfect but functional for demo)
                list += `  Note: ${meals[type].description}\n`;
            }
        });

        if (meals.snacks && Array.isArray(meals.snacks)) {
            list += `\n[SNACKS]\n`;
            meals.snacks.forEach((s: any) => list += `- ${s.name}\n`);
        }

        return list;
    }

    static async checkFatigueAdjustment(userId: number, fatigueLevel: string): Promise<void> {
        await pool.execute('UPDATE Users SET fatigue_level = ? WHERE id = ?', [fatigueLevel, userId]);

        // Logic: If high fatigue, we might want to flag the next workout generation to be "Recovery"
        // Since we generate workouts dynamically via AI, storing the fatigue level in User table 
        // (which we did) is enough, because AIService.generateWorkout reads it.
    }

    // Log Activity for Graph
    static async logActivity(userId: number, type: 'workout' | 'meal' | 'challenge', intensity: number = 1): Promise<void> {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Upsert: If exists for today/type, increment intensity (max 4)
            await pool.execute(`
                INSERT INTO ActivityLogs (user_id, activity_type, intensity, logged_at)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE intensity = LEAST(intensity + 1, 4)
            `, [userId, type, intensity, today]);

            // Also update streak if it's a significant activity (workout or meal)
            if (type === 'workout' || type === 'meal') {
                await this.updateStreak(userId);
            }
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    }

    // Context-Aware Sync: Get recent context (Last Meal & Planned Workout)
    static async getRecentContext(userId: number): Promise<{ lastMeal: any, plannedWorkout: any }> {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];

        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT meals, exercises FROM WorkoutMealPlans WHERE user_id = ? AND day = ?',
            [userId, today]
        );

        if (!rows.length) return { lastMeal: null, plannedWorkout: null };

        const plan = rows[0];
        // Parse if they are strings (sometimes DB drivers return stringified JSON)
        const meals = typeof plan.meals === 'string' ? JSON.parse(plan.meals) : plan.meals;
        const workout = typeof plan.exercises === 'string' ? JSON.parse(plan.exercises) : plan.exercises;

        // Determine "last meal" based on current time
        const hour = new Date().getHours();
        let lastMeal: any = null;

        if (meals) {
            if (hour < 11) lastMeal = meals.breakfast;
            else if (hour < 15) lastMeal = meals.lunch;
            else lastMeal = meals.dinner;
        }

        return {
            lastMeal: lastMeal ? `${lastMeal.name} (${lastMeal.calories} cal)` : null,
            plannedWorkout: workout ? `Targeting: ${workout.map((e: any) => e.name).slice(0, 3).join(', ')}` : null
        };
    }
}
