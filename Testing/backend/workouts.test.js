/**
 * Workout API Tests
 * Tests for workout CRUD and progress tracking
 */

const { API_URL, ensureTestUser } = require('../setup');

let authToken = null;

beforeAll(async () => {
    authToken = await ensureTestUser();
});

describe('💪 Workout API', () => {

    describe('GET /workouts', () => {
        test('should fetch all workouts for user', async () => {
            const response = await fetch(`${API_URL}/workouts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(Array.isArray(data)).toBe(true);
        });

        test('should return workouts with required fields', async () => {
            const response = await fetch(`${API_URL}/workouts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (data.length > 0) {
                expect(data[0]).toHaveProperty('day');
                expect(data[0]).toHaveProperty('exercises');
                expect(data[0]).toHaveProperty('completed_status');
            }
        });
    });

    describe('PUT /workouts/:day', () => {
        test('should update workout exercises', async () => {
            const newExercises = [
                { name: 'Super Saiyan Push-ups', sets: 3, reps: 50 },
                { name: 'Gravity Chamber Squats', sets: 4, reps: 30 }
            ];

            const response = await fetch(`${API_URL}/workouts/Monday`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ exercises: newExercises })
            });

            expect(response.status).toBe(200);
        });
    });

    describe('PATCH /workouts/:day/exercises/:index', () => {
        test('should update exercise completion status', async () => {
            const response = await fetch(`${API_URL}/workouts/Monday/exercises/0`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ completed: true })
            });

            expect(response.status).toBe(200);
        });

        test('should toggle exercise status off', async () => {
            const response = await fetch(`${API_URL}/workouts/Monday/exercises/0`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ completed: false })
            });

            expect(response.status).toBe(200);
        });
    });
});

describe('🤖 AI Workout Generation', () => {

    describe('POST /ai/generate-workout', () => {
        test('should generate home workout', async () => {
            const response = await fetch(`${API_URL}/ai/generate-workout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ type: 'home' })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.workout).toBeDefined();
        }, 30000);

        test('should generate gym workout', async () => {
            const response = await fetch(`${API_URL}/ai/generate-workout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ type: 'gym' })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.workout).toBeDefined();
        }, 30000);
    });
});
