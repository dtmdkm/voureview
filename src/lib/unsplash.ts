import { Setting } from '@/models';
import { connectToDatabase } from './mongodb';

export async function getUnsplashKey() {
  await connectToDatabase();
  const setting = await Setting.findOne({ key: 'unsplash_access_key' });
  return setting?.value || process.env.UNSPLASH_ACCESS_KEY;
}

export async function getUnsplashImage(query: string): Promise<string | null> {
  const accessKey = await getUnsplashKey();
  
  if (!accessKey) {
    console.warn('Unsplash Access Key not configured.');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      }
    );

    if (!response.ok) {
      console.error('Unsplash API Error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.results[0]?.urls?.regular || null;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return null;
  }
}
