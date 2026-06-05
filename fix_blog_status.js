require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  
  const result = await db.collection('blogposts').updateMany(
    { status: 'published' },
    { $set: { status: 'active' } }
  );
  
  console.log(`Updated ${result.modifiedCount} blog posts from 'published' to 'active'.`);
  process.exit(0);
}
run();
