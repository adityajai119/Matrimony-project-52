import express, { Response } from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// ========================
// POWER LEVEL & XP SYSTEM
// ========================

// Get user's power level stats
router.get('/power-level', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const [users] = await pool.execute(
            'SELECT xp_points, power_level, title FROM Users WHERE id = ?',
            [userId]
        ) as any[];

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { xp_points, power_level, title } = users[0];

        // Calculate XP needed for next level
        const xpForNextLevel = power_level * 100;
        const xpProgress = (xp_points % 100) / 100 * 100;

        res.json({
            xp_points,
            power_level,
            title,
            xp_for_next_level: xpForNextLevel,
            xp_progress_percent: xpProgress
        });
    } catch (error: any) {
        console.error('Get power level error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add XP (called when completing workouts/meals)
router.post('/add-xp', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { xp_amount, reason } = req.body;

        if (!xp_amount || xp_amount <= 0) {
            return res.status(400).json({ error: 'Invalid XP amount' });
        }

        // Get current XP
        const [users] = await pool.execute(
            'SELECT xp_points, power_level FROM Users WHERE id = ?',
            [userId]
        ) as any[];

        const currentXP = users[0].xp_points;
        const currentLevel = users[0].power_level;
        const newXP = currentXP + xp_amount;

        // Calculate new level (every 100 XP = 1 level)
        const newLevel = Math.floor(newXP / 100) + 1;

        // Determine title based on level
        let newTitle = 'Rookie';
        if (newLevel >= 50) newTitle = 'Legend';
        else if (newLevel >= 20) newTitle = 'Elite';
        else if (newLevel >= 10) newTitle = 'Warrior';
        else if (newLevel >= 5) newTitle = 'Fighter';

        // Update user
        await pool.execute(
            'UPDATE Users SET xp_points = ?, power_level = ?, title = ? WHERE id = ?',
            [newXP, newLevel, newTitle, userId]
        );

        const leveledUp = newLevel > currentLevel;

        res.json({
            xp_added: xp_amount,
            total_xp: newXP,
            power_level: newLevel,
            title: newTitle,
            leveled_up: leveledUp
        });
    } catch (error: any) {
        console.error('Add XP error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================
// ACHIEVEMENTS SYSTEM
// ========================

// Get user achievements
router.get('/achievements', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const [achievements] = await pool.execute(
            'SELECT badge_type, badge_name, unlocked_at FROM Achievements WHERE user_id = ? ORDER BY unlocked_at DESC',
            [userId]
        ) as any[];

        // All possible achievements
        const allBadges = [
            { type: 'first_workout', name: 'First Workout', icon: 'fitness_center', description: 'Complete your first workout' },
            { type: 'first_meal', name: 'First Meal', icon: 'restaurant', description: 'Log your first meal' },
            { type: 'streak_3', name: '3-Day Streak', icon: 'local_fire_department', description: 'Maintain a 3-day streak' },
            { type: 'streak_7', name: 'Week Warrior', icon: 'emoji_events', description: 'Maintain a 7-day streak' },
            { type: 'streak_30', name: 'Monthly Master', icon: 'military_tech', description: 'Maintain a 30-day streak' },
            { type: 'level_5', name: 'Power Up!', icon: 'bolt', description: 'Reach Power Level 5' },
            { type: 'level_10', name: 'Warrior Spirit', icon: 'shield', description: 'Reach Power Level 10' },
            { type: 'level_20', name: 'Elite Force', icon: 'star', description: 'Reach Power Level 20' },
            { type: 'calories_1000', name: 'Calorie Crusher', icon: 'whatshot', description: 'Burn 1000 calories' },
            { type: 'hydration_hero', name: 'Hydration Hero', icon: 'water_drop', description: 'Complete water intake 7 days' }
        ];

        const unlockedTypes = achievements.map((a: any) => a.badge_type);

        const badgesWithStatus = allBadges.map(badge => ({
            ...badge,
            unlocked: unlockedTypes.includes(badge.type),
            unlocked_at: achievements.find((a: any) => a.badge_type === badge.type)?.unlocked_at
        }));

        res.json(badgesWithStatus);
    } catch (error: any) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Unlock achievement
router.post('/achievements/unlock', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { badge_type, badge_name } = req.body;

        // Insert (ignore if already exists due to unique constraint)
        await pool.execute(
            'INSERT IGNORE INTO Achievements (user_id, badge_type, badge_name) VALUES (?, ?, ?)',
            [userId, badge_type, badge_name]
        );

        res.json({ success: true, badge_type, badge_name });
    } catch (error: any) {
        console.error('Unlock achievement error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================
// DAILY CHALLENGES
// ========================

const CHALLENGE_TEMPLATES = [
    { type: 'pushups', text: 'Do 50 pushups today!', xp: 30 },
    { type: 'squats', text: 'Complete 100 squats!', xp: 35 },
    { type: 'plank', text: 'Hold a plank for 2 minutes total', xp: 25 },
    { type: 'water', text: 'Drink 10 glasses of water', xp: 20 },
    { type: 'steps', text: 'Walk 5000 steps', xp: 40 },
    { type: 'stretching', text: '10 minutes of stretching', xp: 15 },
    { type: 'no_sugar', text: 'No sugar for the entire day!', xp: 50 },
    { type: 'protein', text: 'Eat 100g of protein', xp: 30 },
    { type: 'cardio', text: '20 minutes of cardio', xp: 35 },
    { type: 'meditation', text: '5 minutes of meditation', xp: 20 }
];

// Get today's challenge
router.get('/daily-challenge', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const today = new Date().toISOString().split('T')[0];

        // Check if challenge exists for today
        const [existing] = await pool.execute(
            'SELECT * FROM DailyChallenges WHERE user_id = ? AND challenge_date = ?',
            [userId, today]
        ) as any[];

        if (existing.length > 0) {
            return res.json(existing[0]);
        }

        // Generate new challenge for today
        const randomChallenge = CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)];

        await pool.execute(
            'INSERT INTO DailyChallenges (user_id, challenge_date, challenge_type, challenge_text, xp_reward) VALUES (?, ?, ?, ?, ?)',
            [userId, today, randomChallenge.type, randomChallenge.text, randomChallenge.xp]
        );

        const [newChallenge] = await pool.execute(
            'SELECT * FROM DailyChallenges WHERE user_id = ? AND challenge_date = ?',
            [userId, today]
        ) as any[];

        res.json(newChallenge[0]);
    } catch (error: any) {
        console.error('Get daily challenge error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Complete daily challenge
router.post('/daily-challenge/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const today = new Date().toISOString().split('T')[0];

        // Get challenge
        const [challenges] = await pool.execute(
            'SELECT * FROM DailyChallenges WHERE user_id = ? AND challenge_date = ? AND completed = FALSE',
            [userId, today]
        ) as any[];

        if (challenges.length === 0) {
            return res.status(400).json({ error: 'No incomplete challenge found for today' });
        }

        const challenge = challenges[0];

        // Mark as complete
        await pool.execute(
            'UPDATE DailyChallenges SET completed = TRUE WHERE id = ?',
            [challenge.id]
        );

        // Add XP reward
        const xpReward = challenge.xp_reward;
        await pool.execute(
            'UPDATE Users SET xp_points = xp_points + ? WHERE id = ?',
            [xpReward, userId]
        );

        res.json({ success: true, xp_earned: xpReward });
    } catch (error: any) {
        console.error('Complete challenge error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================
// WATER TRACKER
// ========================

// Get water intake
router.get('/water', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const [users] = await pool.execute(
            'SELECT water_intake FROM Users WHERE id = ?',
            [userId]
        ) as any[];

        res.json({ water_intake: users[0].water_intake, goal: 8 });
    } catch (error: any) {
        console.error('Get water error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add water glass
router.post('/water/add', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        await pool.execute(
            'UPDATE Users SET water_intake = LEAST(COALESCE(water_intake, 0) + 1, 8) WHERE id = ?',
            [userId]
        );

        const [users] = await pool.execute(
            'SELECT water_intake FROM Users WHERE id = ?',
            [userId]
        ) as any[];

        res.json({ water_intake: users[0].water_intake, goal: 8 });
    } catch (error: any) {
        console.error('Add water error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset water (for new day)
router.post('/water/reset', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        await pool.execute(
            'UPDATE Users SET water_intake = 0 WHERE id = ?',
            [userId]
        );

        res.json({ water_intake: 0, goal: 8 });
    } catch (error: any) {
        console.error('Reset water error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================
// WEIGHT/BODY STATS
// ========================

// Log weight
router.post('/weight/log', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { weight } = req.body;

        if (!weight || weight < 1 || weight > 500) {
            return res.status(400).json({ error: 'Invalid weight' });
        }

        await pool.execute(
            'INSERT INTO WeightLogs (user_id, weight) VALUES (?, ?)',
            [userId, weight]
        );

        // Also update current weight in Users
        await pool.execute(
            'UPDATE Users SET weight = ? WHERE id = ?',
            [weight, userId]
        );

        res.json({ success: true, weight });
    } catch (error: any) {
        console.error('Log weight error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get weight history
router.get('/weight/history', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const [logs] = await pool.execute(
            'SELECT weight, logged_at FROM WeightLogs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 30',
            [userId]
        ) as any[];

        res.json(logs);
    } catch (error: any) {
        console.error('Get weight history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================
// LEADERBOARD
// ========================

router.get('/leaderboard', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        // Get top 10 users by power level (excluding test users)
        const [topUsers] = await pool.execute(
            `SELECT id, name, power_level, title, xp_points FROM Users 
             WHERE email NOT LIKE '%test%' AND email NOT LIKE '%warrior%'
             ORDER BY power_level DESC, xp_points DESC LIMIT 10`
        ) as any[];

        // Find current user's rank (excluding test users from count)
        const [userRank] = await pool.execute(
            `SELECT COUNT(*) + 1 as \`rank\` FROM Users 
             WHERE power_level > (SELECT power_level FROM Users WHERE id = ?)
             AND email NOT LIKE '%test%' AND email NOT LIKE '%warrior%'`,
            [userId]
        ) as any[];

        res.json({
            leaderboard: topUsers.map((user: any, index: number) => ({
                rank: index + 1,
                name: user.name,
                power_level: user.power_level,
                title: user.title,
                xp_points: user.xp_points,
                is_current_user: user.id === userId
            })),
            current_user_rank: userRank[0].rank
        });
    } catch (error: any) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
