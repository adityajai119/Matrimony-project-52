import admin from 'firebase-admin';

// Production: Use environment variable (Render/Railway)
// Local: Will fail without env var set
console.log('🔍 Checking Firebase Config...');
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountString) {
    console.log(`📄 Found Env Var (Length: ${serviceAccountString.length})`);
    console.log(`📄 First 20 chars: ${serviceAccountString.substring(0, 20)}...`);
    try {
        // Clean any potential extra quotes that might have been added
        const cleanedString = serviceAccountString.trim();
        const serviceAccount = JSON.parse(cleanedString);

        console.log('✅ JSON Parse Successful');
        console.log(`🔑 Project ID: ${serviceAccount.project_id}`);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('🔥 Firebase: Initialized successfully via admin.initializeApp');
        } else {
            console.log('ℹ️ Firebase: App already initialized');
        }
    } catch (error: any) {
        console.error('❌ Firebase: Failed to parse service account JSON');
        console.error('❌ Parse Error:', error.message);
        // Be careful not to log the full key in production logs if possible, or only do it if necessary
    }
} else {
    console.error('❌ Firebase: FIREBASE_SERVICE_ACCOUNT env var is UNDEFINED or EMPTY');
}

export default admin;
