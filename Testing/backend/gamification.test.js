/**
 * Gamification API Tests
 * Tests for XP, Power Level, Water Tracker, Achievements
 */

const { API_URL, ensureTestUser } = require('../setup');

let authToken = null;

beforeAll(async () => {
    authToken = await ensureTestUser();
});

describe('⚡ Power Level System', () => {

    describe('GET /game/power-level', () => {
        test('should fetch user power level', async () => {
            const response = await fetch(`${API_URL}/game/power-level`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.xp_points).toBeDefined();
            expect(data.power_level).toBeDefined();
            expect(data.title).toBeDefined();
        });
    });

    describe('POST /game/add-xp', () => {
        test('should add XP successfully', async () => {
            const response = await fetch(`${API_URL}/game/add-xp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    xp_amount: 10,
                    reason: 'test_exercise'
                })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.xp_added).toBe(10);
            expect(data.total_xp).toBeDefined();
        });

        test('should reject invalid XP amount', async () => {
            const response = await fetch(`${API_URL}/game/add-xp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    xp_amount: -5,
                    reason: 'invalid'
                })
            });

            expect(response.status).toBe(400);
        });
    });
});

describe('💧 Hydration Tracker', () => {

    describe('GET /game/water', () => {
        test('should fetch water intake', async () => {
            const response = await fetch(`${API_URL}/game/water`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.water_intake).toBeDefined();
            expect(data.goal).toBe(8);
        });
    });

    describe('POST /game/water/add', () => {
        test('should add one glass of water', async () => {
            const response = await fetch(`${API_URL}/game/water/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({})
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.water_intake).toBeDefined();
        });
    });

    describe('POST /game/water/reset', () => {
        test('should reset water intake to zero', async () => {
            const response = await fetch(`${API_URL}/game/water/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({})
            });

            expect(response.status).toBe(200);

            // Verify reset
            const getResponse = await fetch(`${API_URL}/game/water`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await getResponse.json();
            expect(data.water_intake).toBe(0);
        });
    });
});

describe('🏆 Achievements', () => {

    describe('GET /game/achievements', () => {
        test('should fetch all achievements', async () => {
            const response = await fetch(`${API_URL}/game/achievements`, {
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
    });
});

describe('🎯 Daily Challenge', () => {

    describe('GET /game/daily-challenge', () => {
        test('should fetch daily challenge', async () => {
            const response = await fetch(`${API_URL}/game/daily-challenge`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.challenge_text).toBeDefined();
            expect(data.xp_reward).toBeDefined();
        });
    });
});
