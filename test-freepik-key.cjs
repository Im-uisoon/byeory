const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. Try to read .env file
const envPath = path.join(__dirname, '.env');
let apiKey = '';

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/VITE_API_FREEPIK=(.*)/);
        if (match && match[1]) {
            apiKey = match[1].trim().replace(/['"]/g, ''); // Remove quotes if any
            console.log("✅ Found API Key in .env:", apiKey.slice(0, 5) + "...");
        }
    }
} catch (e) {
    console.error("⚠️ Could not read .env file:", e.message);
}

if (!apiKey) {
    console.error("❌ API Key not found. Please make sure VITE_API_FREEPIK is set in .env");
    process.exit(1);
}

// 2. Make Request
const options = {
    hostname: 'api.freepik.com',
    path: '/v1/resources?locale=ko-KR&limit=1&term=cat',
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Accept-Language': 'ko-KR',
        'X-Freepik-API-Key': apiKey
    }
};

console.log("\n📡 Testing API Key with direct request...");

const req = https.request(options, (res) => {
    console.log(`\n⬇️  Response Status: ${res.statusCode} ${res.statusMessage}`);

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (res.statusCode === 200) {
                console.log("✅ SUCCESS! API Key is valid.");
                console.log("   First result:", json.data?.[0]?.title || "Found");
            } else {
                console.error("❌ FAILED. API Error:");
                console.error(JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error("❌ FAILED. Response was not JSON (Likely WAF block):");
            console.log(data.slice(0, 500)); // Print first 500 chars
        }
    });
});

req.on('error', (e) => {
    console.error("❌ Network Error:", e.message);
});

req.end();
