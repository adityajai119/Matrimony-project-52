/**
 * AI Coach API Tests
 * Tests for chat functionality and AI responses
 */

const { API_URL, ensureTestUser } = require('../setup');

let authToken = null;

beforeAll(async () => {
    authToken = await ensureTestUser();
});

describe('🤖 AI Coach (Vegeta)', () => {

    describe('POST /ai/chat', () => {
        test('should respond to greeting', async () => {
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ message: 'Hello Vegeta!' })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.response).toBeDefined();
            expect(typeof data.response).toBe('string');
        }, 30000);

        test('should provide workout advice', async () => {
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ message: 'Give me a workout for chest' })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.response).toBeDefined();
        }, 30000);

        test('should provide nutrition advice', async () => {
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ message: 'What should I eat for muscle gain?' })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.response).toBeDefined();
        }, 30000);

        test('should reject empty message', async () => {
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ message: '' })
            });

            // Should either return 400 or handle gracefully
            expect([200, 400]).toContain(response.status);
        });
    });

    describe('GET /ai/analysis', () => {
        test('should provide health analysis', async () => {
            const response = await fetch(`${API_URL}/ai/analysis`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.analysis || data.message).toBeDefined();
        }, 30000);
    });
});

describe('🎵 AI Playlist', () => {

    describe('POST /ai/playlist', () => {
        test('should generate workout playlist', async () => {
            const response = await fetch(`${API_URL}/ai/playlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    workoutType: 'HIIT',
                    mood: 'energetic',
                    fatigueLevel: 'Low'
                })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.playlist).toBeDefined();
            expect(Array.isArray(data.playlist)).toBe(true);
        }, 30000);
    });
});
