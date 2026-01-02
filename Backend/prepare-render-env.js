const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'src', 'config', 'serviceAccountKey.json');

try {
    if (!fs.existsSync(keyPath)) {
        console.error('❌ Error: Could not find src/config/serviceAccountKey.json');
        process.exit(1);
    }

    const keyContent = fs.readFileSync(keyPath, 'utf8');
    const key = JSON.parse(keyContent);

    // Create the single-line string
    const envString = JSON.stringify(key);

    // Verify it parses back correctly
    try {
        JSON.parse(envString);
        console.log('✅ Validation successful: Generated string is valid JSON.');
    } catch (e) {
        console.error('❌ Validation failed: Generated string is invalid JSON.');
        process.exit(1);
    }

    // Write to a file to avoid terminal copy-paste issues
    const outputPath = path.join(__dirname, 'render_env_value.txt');
    fs.writeFileSync(outputPath, envString);

    console.log('\nSUCCESS! 🎉');
    console.log(`Generated safe environment variable string in:\n👉 ${outputPath}`);
    console.log('\nINSTRUCTIONS:');
    console.log('1. Open that file');
    console.log('2. Copy the ENTIRE content (it is one long line)');
    console.log('3. Paste into Render Environment Variable for FIREBASE_SERVICE_ACCOUNT');

} catch (error) {
    console.error('❌ Unexpected error:', error);
}
