import { apiError } from '@/lib/api-error';
import { NextResponse } from 'next/server';
import { uploadImage, isCloudinaryConfigured } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authenticated) return auth.errorResponse;

    const data = await req.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate mime type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file format. Only JPG, PNG, and WebP are supported.' },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds limit (5MB max).' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary or fallback
    const uploadedUrl = await uploadImage(base64Data, 'laundrymate/orders');

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      source: isCloudinaryConfigured ? 'cloudinary' : 'local-data-uri',
      message: isCloudinaryConfigured
        ? 'Image uploaded to Cloudinary successfully'
        : 'Uploaded via development data-URI fallback (configure Cloudinary in .env.local for production CDN)',
    });
  } catch (err) {
    console.error('Upload error:', err);
    return apiError(err, 'Image upload failed');
  }
}
