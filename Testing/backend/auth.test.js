/**
 * Authentication API Tests
 * Tests for login, register, and Google OAuth endpoints
 */

const API_URL = 'http://localhost:3000/api';

// Test user credentials
const testUser = {
    name: 'Test Warrior',
    email: `test_${Date.now()}@saiyan.com`,
    password: 'KamehamehaX100',
    age: 25,
    gender: 'male',
    height: 175,
    weight: 70,
    goal: 'muscle gain'
};

let authToken = null;

describe('🔐 Authentication API', () => {

    describe('POST /auth/register', () => {
        test('should register a new user successfully', async () => {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testUser)
            });

            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.message).toBe('User registered successfully');
            expect(data.token).toBeDefined();

            authToken = data.token;
        });

        test('should reject duplicate email registration', async () => {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testUser)
            });

            expect(response.status).toBe(400);
        });

        test('should reject incomplete registration data', async () => {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'incomplete@test.com' })
            });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /auth/login', () => {
        test('should login with valid credentials', async () => {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password
                })
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.token).toBeDefined();
            expect(data.user.email).toBe(testUser.email);

            authToken = data.token;
        });

        test('should reject invalid password', async () => {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: 'WrongPassword123'
                })
            });

            expect(response.status).toBe(401);
        });

        test('should reject non-existent user', async () => {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'notexist@test.com',
                    password: 'password123'
                })
            });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /profile', () => {
        test('should fetch profile with valid token', async () => {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.email).toBe(testUser.email);
            expect(data.name).toBe(testUser.name);
        });

        test('should reject request without token', async () => {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            expect(response.status).toBe(401);
        });

        test('should reject invalid token', async () => {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer invalid_token_here'
                }
            });

            expect([401, 403]).toContain(response.status);
        });
    });
});

// Export for use in other tests
module.exports = { testUser, getAuthToken: () => authToken };
