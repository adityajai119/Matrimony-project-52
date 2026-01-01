import admin from 'firebase-admin';

// Production: Use environment variable (Render/Railway)
// Local: Will fail without env var set
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountString) {
    try {
        const serviceAccount = JSON.parse(serviceAccountString);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        console.log('🔥 Firebase: Initialized successfully');
    } catch (error) {
        console.error('❌ Firebase: Failed to parse service account JSON');
    }
} else {
    console.warn('⚠️ Firebase: FIREBASE_SERVICE_ACCOUNT not set - Google Auth disabled');
}

export default admin;
