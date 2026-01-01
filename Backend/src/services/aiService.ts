import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

dotenv.config();

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('🔹 GEMINI_API_KEY loaded:', apiKey ? 'YES (' + apiKey.substring(0, 5) + '...)' : 'NO');

if (!apiKey) {
    console.error('❌ FATAL: GEMINI_API_KEY is missing in .env file');
}

const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

interface UserContext {
    age: number;
    gender: string;
    weight: number;
    height: number;
    goal: string;
    fatigue_level: string;
    streak_count: number;
}

export class AIService {

    static async getUserContext(userId: number): Promise<UserContext | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT age, gender, weight, height, goal, fatigue_level, streak_count FROM Users WHERE id = ?',
            [userId]
        );
        return rows.length ? (rows[0] as UserContext) : null;
    }

    static async chat(userId: number, message: string): Promise<string> {
        const context = await this.getUserContext(userId);
        if (!context) throw new Error('User not found');

        // Fetch last 5 messages for context
        const [historyRows] = await pool.execute<RowDataPacket[]>(
            'SELECT role, message FROM ChatHistory WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
            [userId]
        );

        const history = (historyRows as { role: string; message: string }[]).reverse().map(h => ({
            role: h.role,
            parts: [{ text: h.message }]
        }));

        // System prompt with user context
        // System prompt with user context
        const systemPrompt = `
      You are Vegeta, the Prince of all Saiyans, acting as an elite fitness coach.
      User Profile: ${context.age}yo ${context.gender}, ${context.weight}kg, ${context.height}cm.
      Goal: ${context.goal}. Fatigue Level: ${context.fatigue_level}. Streak: ${context.streak_count} days.
      
      Your goal is to push the user beyond their limits using scientifically accurate advice but wrapped in Dragon Ball Z metaphors (Ki, Power Levels, Super Saiyan, Gravity Training).
      Address the user as "Warrior" or by their name.
      Keep answers concise but intense.
      Tone: ${context.streak_count > 5 ? 'Proud and demanding, like a true Saiyan elite.' : 'Tough love, pushing them to stop being weak.'}.
      Never be soft. Weakness is unacceptable.
      Always end with a short DBZ-style motivation.
    `;

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: 'model',
                    parts: [{ text: "Understood. I'm ready to help you reach your goals!" }]
                },
                ...history
            ]
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        // Save conversation
        await pool.execute('INSERT INTO ChatHistory (user_id, role, message) VALUES (?, ?, ?)', [userId, 'user', message]);
        await pool.execute('INSERT INTO ChatHistory (user_id, role, message) VALUES (?, ?, ?)', [userId, 'model', response]);

        return response;
    }

    static async generateWorkout(userId: number, type: 'gym' | 'home', lastMealContext: string | null = null): Promise<any> {
        const context = await this.getUserContext(userId);
        if (!context) throw new Error('User not found');

        const prompt = `
      Generate a single daily workout routine for a ${context.gender} focused on ${context.goal}.
      Location: ${type}.
      Fatigue Level: ${context.fatigue_level} (Adjust intensity accordingly).
      
      CONTEXT AWARENESS:
      ${lastMealContext ? `User recently ate: "${lastMealContext}". Adjust intensity based on this energy intake.` : ''}

      Format: JSON object with 'exercises' array. Each exercise object has: 'name', 'sets', 'reps', 'instructions'.
      Do NOT wrap the json in code blocks. Just return the raw JSON string.
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        try {
            return JSON.parse(text.replace(/```json|```/g, ''));
        } catch (e) {
            console.error('Failed to parse AI response', text);
            throw new Error('Failed to generate workout plan');
        }
    }

    static async generateMealPlan(userId: number, workoutContext: string | null = null): Promise<any> {
        const context = await this.getUserContext(userId);
        if (!context) throw new Error('User not found');

        const prompt = `
      Generate a daily meal plan for a ${context.gender} focused on ${context.goal}.
      Current Weight: ${context.weight}kg.
      Fatigue Level: ${context.fatigue_level} (Suggest recovery foods if High).
      
      CONTEXT AWARENESS:
      ${workoutContext ? `User's workout plan includes: "${workoutContext}". Ensure meals provide appropriate fuel/recovery for this training.` : ''}

      Format: JSON object with keys: 'breakfast', 'lunch', 'dinner', 'snacks' (array), 'totalCalories' (number).
      Each meal object has: 'name', 'calories', 'description'.
      Total calories should be appropriate for the goal.
      Do NOT wrap the json in code blocks. Just raw JSON.
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        try {
            return JSON.parse(text.replace(/```json|```/g, ''));
        } catch (e) {
            console.error('Failed to parse AI response', text);
            throw new Error('Failed to generate meal plan');
        }
    }

    static async swapMeal(userId: number, currentMeal: string): Promise<any> {
        const context = await this.getUserContext(userId);
        const prompt = `
      Suggest a healthy alternative for this meal: "${currentMeal}".
      User Goal: ${context?.goal}.
      Constraint: Must have similar calories and macros.
      Format: JSON object with 'name', 'calories', 'description', 'reason'.
      Do NOT wrap in code blocks.
    `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            console.log('Gemini Swap Response:', text); // Debug log

            // Clean response (remove markdown if present)
            const cleanJson = text.replace(/```json|```/g, '').trim();

            return JSON.parse(cleanJson);
        } catch (e: any) {
            console.error('Swap Meal Error:', e);
            throw new Error('Failed to swap meal: ' + (e.message || 'Unknown error'));
        }
    }

    static async getHealthAnalysis(userId: number): Promise<string> {
        try {
            const context = await this.getUserContext(userId);
            const prompt = `
          Provide a weekly health summary for a user.
          Goal: ${context?.goal}. Streak: ${context?.streak_count}.
          Fatigue: ${context?.fatigue_level}.
          Give structured feedback on consistency, recovery, and motivation.
          Keep it human-like and friendly.
        `;
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e: any) {
            console.error('Health Analysis Error:', e);
            return "I'm having trouble analyzing your data right now. Keep going!";
        }
    }

    static async analyzeFoodImage(imageBuffer: Buffer, mimeType: string): Promise<any> {
        const prompt = `
      Analyze this food image.
      Identify the meal/food items.
      Estimate the calories and macros (Protein, Carbs, Fat).
      Format: JSON object with keys:
      - name: string (Short descriptive name)
      - calories: number (Estimate)
      - protein: number (g)
      - carbs: number (g)
      - fat: number (g)
      - description: string (Brief analysis)
      - healthy: boolean
      - advice: string (Quick tip)
      
      Do NOT wrap in code blocks. Just raw JSON.
    `;

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType
            }
        };

        try {
            const result = await model.generateContent([prompt, imagePart]);
            const text = result.response.text();

            console.log('Gemini Vision Response:', text); // Debug log

            const cleanJson = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e: any) {
            console.error('AI Analysis Failed:', e);

            if (e.message?.includes('400')) {
                throw new Error('Image analysis failed. Please try a clearer photo.');
            }
            throw new Error('Failed to analyze food image');
        }
    }

    static async getPlaylistRecommendation(
        userId: number,
        workoutType: string,
        mood: string,
        fatigueLevel: string
    ): Promise<any[]> {
        try {
            const context = await this.getUserContext(userId);

            const prompt = `
You are a workout music DJ. Generate a personalized playlist of 6-8 songs for a workout.

User Context:
- Workout Type: ${workoutType || 'mixed'}
- Current Mood: ${mood || 'energetic'}
- Fatigue Level: ${fatigueLevel || 'medium'}
- Fitness Goal: ${context?.goal || 'general fitness'}

Requirements:
- For WARM-UP: Choose moderate tempo songs (90-110 BPM)
- For INTENSE workout: Choose high energy songs (120-160 BPM)
- For COOL-DOWN: Choose calm, relaxing songs (60-90 BPM)
- If fatigue is HIGH, include more motivational songs
- Mix popular workout anthems with some variety

Return ONLY a valid JSON array with this exact format (no extra text):
[
  {
    "name": "Song Title",
    "artist": "Artist Name",
    "youtubeId": "VALID_YOUTUBE_VIDEO_ID",
    "bpm": 120,
    "type": "intense"
  }
]

IMPORTANT: Use REAL YouTube video IDs for actual songs. Popular workout songs include:
- "Eye of the Tiger" by Survivor (btPJPFnesV4)
- "Stronger" by Kanye West (PsO6ZnUZI0g)
- "Lose Yourself" by Eminem (_Yhyp-_hX2s)
- "Can't Hold Us" by Macklemore (2zNSgSzhBfM)
- "Till I Collapse" by Eminem (ytQ5CYE1VZw)
- "Thunderstruck" by AC/DC (v2AC41dglnM)
- "Levels" by Avicii (_ovdm2yX4MA)
- "Don't Stop Me Now" by Queen (HgzGwKwLmgM)
`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Clean and parse JSON
            const cleanJson = text.replace(/```json|```/g, '').trim();
            const playlist = JSON.parse(cleanJson);

            return playlist;
        } catch (e: any) {
            console.error('Playlist Generation Error:', e);
            // Return fallback playlist
            return [
                { name: 'Eye of the Tiger', artist: 'Survivor', youtubeId: 'btPJPFnesV4', bpm: 109, type: 'intense' },
                { name: 'Stronger', artist: 'Kanye West', youtubeId: 'PsO6ZnUZI0g', bpm: 104, type: 'intense' },
                { name: 'Lose Yourself', artist: 'Eminem', youtubeId: '_Yhyp-_hX2s', bpm: 86, type: 'intense' },
                { name: "Can't Hold Us", artist: 'Macklemore', youtubeId: '2zNSgSzhBfM', bpm: 146, type: 'intense' },
                { name: 'Levels', artist: 'Avicii', youtubeId: '_ovdm2yX4MA', bpm: 126, type: 'warm-up' },
                { name: 'Breathe', artist: 'Télépopmusik', youtubeId: 'vyut3GyQtn0', bpm: 75, type: 'cool-down' }
            ];
        }
    }

    static async parseVoiceIntent(transcript: string, currentPlaylist: any[]): Promise<any> {
        try {
            const playlistSummary = currentPlaylist.slice(0, 10).map(t =>
                `${t.name} by ${t.artist}`
            ).join(', ');

            const prompt = `
You are an intelligent voice assistant for a workout music player. Parse the user's voice command and determine their intent.

User said: "${transcript}"

Current playlist includes: ${playlistSummary || 'various workout songs'}

Analyze the command and return ONLY a valid JSON object with this format:
{
  "intent": "INTENT_TYPE",
  "action": "action_to_take",
  "params": { ... optional parameters ... }
}

Possible intents and their responses:

1. PLAY_SPECIFIC_SONG - User wants to play a specific song
   Example: "play eye of the tiger", "play stronger by kanye"
   Response: { "intent": "play_song", "action": "play", "params": { "songName": "Eye of the Tiger", "artist": "Survivor" } }

2. PLAY_LANGUAGE_PLAYLIST - User wants songs in a specific language
   Example: "play hindi songs", "play telugu workout music", "play spanish hits"
   Response: { "intent": "language_playlist", "action": "generate_playlist", "params": { "language": "Hindi", "mood": "energetic" } }

3. PLAY_GENRE_PLAYLIST - User wants a specific genre
   Example: "play rock music", "play hip hop", "play electronic"
   Response: { "intent": "genre_playlist", "action": "generate_playlist", "params": { "genre": "rock", "mood": "intense" } }

4. PLAY_MOOD_PLAYLIST - User wants music for a mood
   Example: "play something motivating", "play chill music", "play pump up songs"
   Response: { "intent": "mood_playlist", "action": "generate_playlist", "params": { "mood": "motivating" } }

5. PLAY_ARTIST - User wants songs by a specific artist
   Example: "play eminem", "play songs by kanye west"
   Response: { "intent": "artist_playlist", "action": "generate_playlist", "params": { "artist": "Eminem" } }

6. RESUME_PLAY - Just play/resume current music
   Example: "play", "play music", "start"
   Response: { "intent": "simple_command", "action": "play", "params": {} }

7. UNKNOWN - Cannot understand the command
   Response: { "intent": "unknown", "action": "none", "params": { "message": "Sorry, I didn't understand that" } }

Return ONLY the JSON, no extra text.
`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            const cleanJson = text.replace(/```json|```/g, '').trim();
            const intent = JSON.parse(cleanJson);

            console.log('🎤 Voice Intent:', intent);
            return intent;
        } catch (e: any) {
            console.error('Voice Intent Parse Error:', e);
            return {
                intent: 'unknown',
                action: 'none',
                params: { message: 'Failed to understand command' }
            };
        }
    }
}
