/**
 * Frontend API Tests
 * Tests frontend connectivity and static assets
 */

const FRONTEND_URL = 'http://localhost:4200';

describe('🌐 Frontend Connectivity', () => {

    describe('GET /', () => {
        test('should serve the Angular app', async () => {
            const response = await fetch(FRONTEND_URL);

            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toContain('text/html');
        });

        test('should contain app root element', async () => {
            const response = await fetch(FRONTEND_URL);
            const html = await response.text();

            expect(html).toContain('<app-root>');
        });
    });

    describe('Static Assets', () => {
        test('should serve favicon', async () => {
            const response = await fetch(`${FRONTEND_URL}/favicon.ico`);

            // 200 or 204 are both valid
            expect([200, 204, 304]).toContain(response.status);
        });

        test('should serve styles', async () => {
            const response = await fetch(FRONTEND_URL);
            const html = await response.text();

            // Check that CSS is linked
            expect(html).toContain('styles');
        });
    });
});

describe('🔌 Frontend-Backend Integration', () => {

    describe('API Proxy', () => {
        test('should be able to reach backend health endpoint', async () => {
            const response = await fetch('http://localhost:3000/api/health');
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.status).toBe('OK');
        });
    });
});
