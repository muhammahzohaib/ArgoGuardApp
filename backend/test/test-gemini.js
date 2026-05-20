const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

console.log('Testing with "gemini-2.5-flash"...');
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

model.generateContent('Say "API Connection Successful" if you receive this message.')
  .then(res => {
    console.log('\n--- SUCCESS ---');
    console.log('Gemini response:', res.response.text().trim());
    console.log('The "gemini-2.5-flash" model is supported and working!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n--- FAILURE ---');
    console.error('Failed to query "gemini-2.5-flash":', err.message);
    process.exit(1);
  });
