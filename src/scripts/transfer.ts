import mongoose from 'mongoose';

// Connection Strings
const SOURCE_URI = 'mongodb+srv://vucuong:Cuong%40123@cluster0.xw51drl.mongodb.net/test'; // Lấy từ DB "test"
const TARGET_URI = 'mongodb+srv://ktuanminh3_db_user:Tuanminh!%4012@cluster0.jiizhnt.mongodb.net/voureview';

async function transfer() {
  console.log('🚀 Đang bắt đầu quá trình chuyển dữ liệu từ database "test" cũ...');

  try {
    const sourceConn = await mongoose.createConnection(SOURCE_URI).asPromise();
    const targetConn = await mongoose.createConnection(TARGET_URI).asPromise();

    const storeSchema = new mongoose.Schema({}, { strict: false });
    const dealSchema = new mongoose.Schema({}, { strict: false });
    const categorySchema = new mongoose.Schema({}, { strict: false });
    const eventSchema = new mongoose.Schema({}, { strict: false });

    // Models mapping
    const SourceStore = sourceConn.model('Store', storeSchema, 'stores');
    const SourceDeal = sourceConn.model('Deal', dealSchema, 'deals');
    const SourceCategory = sourceConn.model('Category', categorySchema, 'categories');
    const SourceEvent = sourceConn.model('Event', eventSchema, 'eventsales');

    const TargetStore = targetConn.model('Store', storeSchema, 'stores');
    const TargetDeal = targetConn.model('Deal', dealSchema, 'deals');
    const TargetCategory = targetConn.model('Category', categorySchema, 'categories');
    const TargetEvent = targetConn.model('EventSale', eventSchema, 'eventsales');

    console.log('📦 Đang lấy 10 mẫu từ mỗi loại...');
    const stores = await SourceStore.find().limit(10).lean();
    const deals = await SourceDeal.find().limit(10).lean();
    const categories = await SourceCategory.find().limit(10).lean();
    const events = await SourceEvent.find().limit(6).lean();

    console.log(`- Tìm thấy: ${stores.length} Stores, ${deals.length} Deals, ${categories.length} Categories, ${events.length} Events.`);

    if (stores.length > 0) {
      console.log('📤 Chuyển Stores...');
      await TargetStore.insertMany(stores);
    }
    if (deals.length > 0) {
      console.log('📤 Chuyển Deals...');
      await TargetDeal.insertMany(deals);
    }
    if (categories.length > 0) {
      console.log('📤 Chuyển Categories...');
      await TargetCategory.insertMany(categories);
    }
    if (events.length > 0) {
      console.log('📤 Chuyển Events...');
      await TargetEvent.insertMany(events);
    }

    console.log('\n✨ XONG! Đã chuyển dữ liệu thành công.');
    
    await sourceConn.close();
    await targetConn.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

transfer();
