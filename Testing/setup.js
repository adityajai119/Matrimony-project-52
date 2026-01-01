/**
 * Test Setup Helper
 * Creates a test user automatically if it doesn't exist
 */

const API_URL = 'http://localhost:3000/api';

const TEST_USER = {
    name: 'Test Warrior',
    email: 'testwarrior@saiyan.com',
    password: 'KamehamehaX100',
    age: 25,
    gender: 'male',
    height: 175,
    weight: 70,
    goal: 'muscle gain'
};

let cachedToken = null;

/**
 * Ensures a test user exists and returns an auth token
 * Will create the user if they don't exist, or login if they do
 */
async function ensureTestUser() {
    if (cachedToken) return cachedToken;

    // First, try to login
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: TEST_USER.email,
            password: TEST_USER.password
        })
    });

    if (loginResponse.ok) {
        const data = await loginResponse.json();
        cachedToken = data.token;
        console.log('✅ Logged in as existing test user');
        return cachedToken;
    }

    // User doesn't exist, create them
    console.log('📝 Test user not found, creating...');

    const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER)
    });

    if (registerResponse.ok) {
        const data = await registerResponse.json();
        cachedToken = data.token;
        console.log('✅ Test user created successfully');
        return cachedToken;
    }

    throw new Error('Failed to create or login test user');
}

/**
 * Gets current auth token
 */
function getAuthToken() {
    return cachedToken;
}

/**
 * Clears cached token (for testing auth failures)
 */
function clearAuthToken() {
    cachedToken = null;
}

module.exports = {
    API_URL,
    TEST_USER,
    ensureTestUser,
    getAuthToken,
    clearAuthToken
};
