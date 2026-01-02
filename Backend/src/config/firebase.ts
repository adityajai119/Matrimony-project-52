import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Checking Firebase Config...');

let firebaseInitialized = false;

// Method 1: Try JSON file first (for LOCAL development)
// Check multiple possible locations
const possiblePaths = [
    path.join(__dirname, 'serviceAccountKey.json'),           // Same folder as config
    path.join(__dirname, '../../firebase-service-account.json'), // Backend root
    path.join(__dirname, '../../serviceAccountKey.json')         // Backend root alt name
];

let jsonFilePath = '';
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        jsonFilePath = p;
        break;
    }
}

if (fs.existsSync(jsonFilePath)) {
    try {
        const serviceAccount = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        console.log(`🔑 Found JSON file: ${serviceAccount.project_id}`);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('🔥 Firebase: Initialized via JSON file (local)');
            firebaseInitialized = true;
        }
    } catch (error: any) {
        console.error('❌ Firebase: Failed to read JSON file:', error.message);
    }
}

// Method 2: Try environment variable (for PRODUCTION - Render)
if (!firebaseInitialized) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountString) {
        console.log(`📄 Found Env Var (Length: ${serviceAccountString.length})`);
        try {
            const serviceAccount = JSON.parse(serviceAccountString.trim());
            console.log(`🔑 Project ID: ${serviceAccount.project_id}`);

            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log('🔥 Firebase: Initialized via env var (production)');
                firebaseInitialized = true;
            }
        } catch (error: any) {
            console.error('❌ Firebase: Failed to parse env var JSON:', error.message);
        }
    }
}

if (!firebaseInitialized) {
    console.warn('⚠️ Firebase: NOT initialized - Google Sign-In will not work');
    console.warn('⚠️ For local: Add firebase-service-account.json to Backend folder');
    console.warn('⚠️ For production: Set FIREBASE_SERVICE_ACCOUNT env var on Render');
}

export default admin;

