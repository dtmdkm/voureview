import mongoose from 'mongoose';

const SOURCE_URI = 'mongodb+srv://vucuong:Cuong%40123@cluster0.xw51drl.mongodb.net/';

async function check() {
  try {
    const conn = await mongoose.createConnection(SOURCE_URI).asPromise();
    const admin = conn.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Các Database hiện có trên Cluster cũ:');
    dbs.databases.forEach((db: any) => console.log(`- ${db.name}`));
    
    // Check voureview specifically if it exists
    const voureviewDb = conn.useDb('voureview');
    const collections = await voureviewDb.db.listCollections().toArray();
    console.log('\nCác Collection trong database "voureview":');
    collections.forEach((col: any) => console.log(`- ${col.name}`));

    await conn.close();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

check();
