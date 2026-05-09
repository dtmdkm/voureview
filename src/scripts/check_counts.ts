import mongoose from 'mongoose';

const SOURCE_URI = 'mongodb+srv://vucuong:Cuong%40123@cluster0.xw51drl.mongodb.net/';

async function check() {
  try {
    const conn = await mongoose.createConnection(SOURCE_URI).asPromise();
    
    const dbs = ['test', 'voureview'];
    for (const dbName of dbs) {
      console.log(`\n--- Kiểm tra Database: ${dbName} ---`);
      const db = conn.useDb(dbName);
      const collections = await db.db.listCollections().toArray();
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`- Collection: ${col.name} | Số lượng: ${count}`);
      }
    }

    await conn.close();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

check();
