require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  const setting = await db.collection('settings').findOne({ key: 'home_banners' });
  console.log('BANNERS:', JSON.stringify(setting.value, null, 2));
  process.exit(0);
}
run();
