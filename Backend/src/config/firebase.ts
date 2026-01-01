import admin from 'firebase-admin';

// For production: use environment variable
// For local dev: use serviceAccountKey.json file
let serviceAccount: any;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Production: Parse from environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('🔥 Firebase: Using service account from environment variable');
} else {
    // Local development: Use file
    try {
        serviceAccount = require('./serviceAccountKey.json');
        console.log('🔥 Firebase: Using local serviceAccountKey.json');
    } catch (e) {
        console.error('❌ Firebase: No service account found!');
        console.error('   Set FIREBASE_SERVICE_ACCOUNT env var or add serviceAccountKey.json');
    }
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    console.warn('⚠️ Firebase Admin not initialized - Google Auth will not work');
}

export default admin;
