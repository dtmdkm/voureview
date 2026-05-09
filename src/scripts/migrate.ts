import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { Store, Deal, Category } from '../models';

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
  if (!MONGODB_URI) {
    console.error('Lỗi: Chưa cấu hình MONGODB_URI trong .env.local');
    process.exit(1);
  }

  try {
    console.log('Đang kết nối tới MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Kết nối thành công!');

    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    const rawData = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log('Đang xóa dữ liệu cũ trong Database...');
    await Promise.all([
      Store.deleteMany({}),
      Deal.deleteMany({}),
      Category.deleteMany({})
    ]);

    console.log('Đang nhập dữ liệu mới...');
    
    if (data.popularStores) {
      await Store.insertMany(data.popularStores.map((s: any) => ({
        name: s.name,
        link: s.link,
        image: s.image
      })));
      console.log(`Đã nhập ${data.popularStores.length} cửa hàng.`);
    }

    if (data.deals) {
      await Deal.insertMany(data.deals.map((d: any) => ({
        title: d.title,
        price: d.price,
        discountPrice: d.discountPrice,
        link: d.link,
        description: d.description,
        image: d.image
      })));
      console.log(`Đã nhập ${data.deals.length} ưu đãi.`);
    }

    if (data.categories) {
      await Category.insertMany(data.categories.map((c: any) => ({
        name: c.name,
        link: c.link
      })));
      console.log(`Đã nhập ${data.categories.length} danh mục.`);
    }

    console.log('=== CHÚC MỪNG: DI CƯ DỮ LIỆU HOÀN TẤT! ===');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi trong quá trình di cư:', error);
    process.exit(1);
  }
}

migrate();
