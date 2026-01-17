const jwt = require('jsonwebtoken');

const secret = 'sb_secret_cZUIIEEltJGMGCDnyI768Q_Ar0pTrvJ';
const payload = {
    aud: 'authenticated', // standard audience
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365 * 10), // 10 years expiration
    iat: Math.floor(Date.now() / 1000),
    iss: 'supabase',
    role: 'service_role' // THE KEY PART: Granting God Mode
};

const token = jwt.sign(payload, secret);
const fs = require('fs');
fs.writeFileSync('env_key.txt', token);
console.log('Token written to env_key.txt');
