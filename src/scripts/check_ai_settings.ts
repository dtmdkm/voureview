const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { connectToDatabase } = require('../lib/mongodb');
const { Setting } = require('../models');

async function check() {
  await connectToDatabase();
  const keys = ['openai_api_key', 'openai_model', 'openai_base_url', 'gemini_api_key', 'gemini_model'];
  const settings = await Setting.find({ key: { $in: keys } });
  
  console.log('--- Database Settings ---');
  settings.forEach(s => {
    console.log(`${s.key}: "${s.value}" (Type: ${typeof s.value})`);
  });

  console.log('\n--- Environment Variables ---');
  console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'Set (starts with ' + process.env.OPENAI_API_KEY.substring(0, 5) + ')' : 'Not Set'}`);
  console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'Set (starts with ' + process.env.GEMINI_API_KEY.substring(0, 5) + ')' : 'Not Set'}`);
  
  process.exit(0);
}

check();
