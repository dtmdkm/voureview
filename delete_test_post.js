require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  
  const result = await db.collection('blogposts').deleteMany({ title: 'aaaaaa' });
  console.log(`Deleted ${result.deletedCount} test posts.`);
  process.exit(0);
}
run();
