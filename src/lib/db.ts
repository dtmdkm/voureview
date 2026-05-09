import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

export async function getDbData() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { popularStores: [], deals: [], categories: [] };
  }
}

export async function saveDbData(data: any) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to db.json:', error);
    return false;
  }
}
