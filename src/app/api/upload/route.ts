import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Limit file size to 2MB to prevent database bloat
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large', 
        message: 'Vui lòng chọn ảnh dưới 2MB để đảm bảo hiệu năng.' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to Base64
    const base64Image = buffer.toString('base64');
    const contentType = file.type || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64Image}`;

    console.log('File converted to Base64 successfully');
    
    return NextResponse.json({ url: dataUrl });
  } catch (error: any) {
    console.error('Upload Error Details:', error);
    return NextResponse.json({ 
      error: 'Failed to process image', 
      message: error.message 
    }, { status: 500 });
  }
}
