/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'node',
    verbose: true,
    testTimeout: 30000,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'html'],
    testMatch: [
        '**/backend/**/*.test.js',
        '**/frontend/**/*.test.js'
    ],
    moduleFileExtensions: ['js', 'json']
};

module.exports = config;
