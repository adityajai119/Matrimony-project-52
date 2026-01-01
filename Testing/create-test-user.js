/**
 * Create Test User Script
 * Run this once to create the test user in the database
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

async function createTestUser() {
    console.log('🔧 Creating test user...\n');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Test user created successfully!');
            console.log(`📧 Email: ${TEST_USER.email}`);
            console.log(`🔑 Password: ${TEST_USER.password}`);
            console.log(`🎫 Token: ${data.token?.substring(0, 50)}...`);
        } else if (data.error?.includes('exists') || data.error?.includes('duplicate') || data.error?.includes('registered')) {
            console.log('ℹ️  Test user already exists!');
            console.log(`📧 Email: ${TEST_USER.email}`);
            console.log(`🔑 Password: ${TEST_USER.password}`);
        } else {
            console.log('❌ Failed to create user:', data.error || data);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n⚠️  Make sure the backend is running on localhost:3000');
    }
}

createTestUser();
