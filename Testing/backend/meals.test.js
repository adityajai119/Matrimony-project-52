/**
 * Meal Planning API Tests
 * Tests for meal CRUD and AI meal generation
 */

const { API_URL, ensureTestUser } = require('../setup');

let authToken = null;

beforeAll(async () => {
    authToken = await ensureTestUser();
});

describe('🍗 Meal Planning API', () => {

    describe('GET /meals', () => {
        test('should fetch all meal plans', async () => {
            const response = await fetch(`${API_URL}/meals`, {
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

        test('should return meals with required structure', async () => {
            const response = await fetch(`${API_URL}/meals`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (data.length > 0) {
                expect(data[0]).toHaveProperty('day');
                expect(data[0]).toHaveProperty('meals');
                expect(data[0].meals).toHaveProperty('breakfast');
                expect(data[0].meals).toHaveProperty('lunch');
                expect(data[0].meals).toHaveProperty('dinner');
            }
        });
    });

    describe('PATCH /meals/:day/meals/:mealType', () => {
        test('should update meal completion status', async () => {
            const response = await fetch(`${API_URL}/meals/Monday/meals/breakfast`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ completed: true })
            });

            expect(response.status).toBe(200);
        });

        test('should toggle meal status off', async () => {
            const response = await fetch(`${API_URL}/meals/Monday/meals/breakfast`, {
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

describe('🤖 AI Meal Generation', () => {

    describe('POST /ai/generate-meal', () => {
        test('should generate a meal plan', async () => {
            const response = await fetch(`${API_URL}/ai/generate-meal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({})
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.mealPlan).toBeDefined();
        }, 30000);
    });

    describe('POST /ai/swap-meal', () => {
        test('should suggest alternative meal', async () => {
            const response = await fetch(`${API_URL}/ai/swap-meal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ currentMeal: 'Oatmeal with Banana' })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.alternative).toBeDefined();
        }, 30000);
    });
});
