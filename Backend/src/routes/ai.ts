import express from 'express';
import { AIService } from '../services/aiService';
import { LogicEngine } from '../services/logicEngine';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Chat with Fitness Coach
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        // @ts-ignore - user is added by auth middleware
        const userId = (req as any).userId;
        const response = await AIService.chat(userId, message);
        res.json({ response });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Generate/Regenerate Workout
router.post('/generate-workout', authenticateToken, async (req, res) => {
    try {
        const { type } = req.body; // 'gym' or 'home'
        const userId = (req as any).userId;

        // Fetch context: What did they eat recently?
        const { lastMeal } = await LogicEngine.getRecentContext(userId);

        const workout = await AIService.generateWorkout(userId, type || 'home', lastMeal);
        res.json({ workout });
    } catch (error: any) {
        console.error('❌ AI GENERATION FAILED:', error);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
        res.status(500).json({ error: error.message, details: error.toString() });
    }
});

// Generate Meal Plan
router.post('/generate-meal', authenticateToken, async (req, res) => {
    try {
        const userId = (req as any).userId;

        // Fetch context: What is their planned workout?
        const { plannedWorkout } = await LogicEngine.getRecentContext(userId);

        const mealPlan = await AIService.generateMealPlan(userId, plannedWorkout);
        res.json({ mealPlan });
    } catch (error: any) {
        console.error('❌ MEAL GEN FAILED:', error);
        res.status(500).json({ error: error.message });
    }
});

// Swap Meal
router.post('/swap-meal', authenticateToken, async (req, res) => {
    try {
        const { currentMeal } = req.body;
        const userId = (req as any).userId;
        const alternative = await AIService.swapMeal(userId, currentMeal);
        res.json({ alternative });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get Health Analysis
router.get('/analysis', authenticateToken, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const analysis = await AIService.getHealthAnalysis(userId);
        res.json({ analysis });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update Fatigue (Input for Logic Engine)
router.post('/fatigue', authenticateToken, async (req, res) => {
    try {
        const { level } = req.body; // 'Low', 'Medium', 'High'
        const userId = (req as any).userId;
        await LogicEngine.checkFatigueAdjustment(userId, level);
        res.json({ message: 'Fatigue level updated' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Configure multer for memory storage
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

// Analyze Food Image (Gemini Vision)
// @ts-ignore
router.post('/analyze-food', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            // @ts-ignore
            return res.status(400).json({ error: 'No image provided' });
        }

        const analysis = await AIService.analyzeFoodImage(req.file.buffer, req.file.mimetype);
        res.json({ analysis });
    } catch (error: any) {
        console.error('❌ AI ANALYSIS FAILED:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate Grocery List
router.get('/grocery-list/:day', authenticateToken, async (req, res) => {
    try {
        const { day } = req.params;
        const userId = (req as any).userId;
        const list = await LogicEngine.generateGroceryList(userId, day);
        res.json({ list });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// AI Playlist Recommendation
router.post('/playlist', authenticateToken, async (req, res) => {
    try {
        const { workoutType, mood, fatigueLevel } = req.body;
        const userId = (req as any).userId;
        const playlist = await AIService.getPlaylistRecommendation(userId, workoutType, mood, fatigueLevel);
        res.json({ playlist });
    } catch (error: any) {
        console.error('❌ PLAYLIST GEN FAILED:', error);
        res.status(500).json({ error: error.message });
    }
});

// AI Voice Intent Parser - Natural Language Understanding for Music
router.post('/voice-intent', authenticateToken, async (req, res) => {
    try {
        const { transcript, currentPlaylist } = req.body;
        const userId = (req as any).userId;
        const intent = await AIService.parseVoiceIntent(transcript, currentPlaylist);
        res.json(intent);
    } catch (error: any) {
        console.error('❌ VOICE INTENT FAILED:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
