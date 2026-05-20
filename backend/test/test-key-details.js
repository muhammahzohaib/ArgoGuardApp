const https = require('https');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

const options = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: `/v1beta/models?key=${apiKey}`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const names = parsed.models.map(m => m.name);
      console.log('Available models:');
      names.forEach(name => {
        if (name.includes('flash') || name.includes('gemini-1.5') || name.includes('gemini-2.0') || name.includes('gemini-2.5') || name.includes('gemini-3.')) {
          console.log(` - ${name}`);
        }
      });
    } catch (e) {
      console.log('Error parsing:', e.message);
    }
  });
});

req.end();
