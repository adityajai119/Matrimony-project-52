/**
 * OTP Email Verification API Tests
 * Tests for send-otp, verify-otp, and resend-otp endpoints
 */

const API_URL = 'http://localhost:3000/api';

// Test user for OTP tests (unique email each run)
const otpTestUser = {
    name: 'OTP Test Warrior',
    email: `otp_test_${Date.now()}@saiyan.com`,
    password: 'KamehamehaX100',
    age: 25,
    gender: 'Male',
    height: 175,
    weight: 70,
    goal: 'muscle gain'
};

describe('🔐 OTP Email Verification API', () => {

    describe('POST /auth/send-otp', () => {
        test('should send OTP for new user registration', async () => {
            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(otpTestUser)
            });

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.message).toBe('OTP sent successfully');
            expect(data.email).toBe(otpTestUser.email);
            expect(data.expiresIn).toBe(600);
        });

        test('should reject send-otp with missing fields', async () => {
            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'incomplete@test.com' })
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('All fields are required');
        });

        test('should reject send-otp for already registered email', async () => {
            // First, we need to complete a registration to have a user in the system
            // Use the setup user that already exists
            const existingUser = {
                ...otpTestUser,
                email: 'testwarrior@saiyan.com' // This user should exist from setup
            };

            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(existingUser)
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Email already registered');
        });

        test('should reject invalid goal', async () => {
            const invalidUser = {
                ...otpTestUser,
                email: `invalid_goal_${Date.now()}@test.com`,
                goal: 'become super saiyan'
            };

            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invalidUser)
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Invalid goal');
        });
    });

    describe('POST /auth/verify-otp', () => {
        test('should reject verify-otp with missing email', async () => {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: '123456' })
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Email and OTP are required');
        });

        test('should reject verify-otp with missing OTP', async () => {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@test.com' })
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Email and OTP are required');
        });

        test('should reject verify-otp for non-pending registration', async () => {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'nonexistent@test.com',
                    otp: '123456'
                })
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('No pending registration found. Please register again.');
        });

        test('should reject verify-otp with wrong OTP', async () => {
            // First send OTP
            const newUser = {
                ...otpTestUser,
                email: `wrong_otp_${Date.now()}@test.com`
            };

            await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            // Then try with wrong OTP
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newUser.email,
                    otp: '000000'
                })
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Invalid OTP');
        });
    });

    describe('POST /auth/resend-otp', () => {
        test('should reject resend-otp without email', async () => {
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Email is required');
        });

        test('should reject resend-otp for non-pending registration', async () => {
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'nonexistent@test.com' })
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('No pending registration found');
        });

        test('should resend OTP for pending registration', async () => {
            // First send OTP
            const newUser = {
                ...otpTestUser,
                email: `resend_test_${Date.now()}@test.com`
            };

            await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            // Then resend
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newUser.email })
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.message).toBe('New OTP sent successfully');
        });
    });
});
