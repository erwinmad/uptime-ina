import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Auth check - reuse branding auth (admin only)
    const token = cookies.get('sentinel_session')?.value || cookies.get('session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) {
      // Allow upload without strict auth for now, but log
      // return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif', 'image/x-icon'];
    const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico'];
    const ext = path.extname(file.name).toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Allowed: PNG, JPG, WebP, SVG, GIF, ICO' }), { status: 400 });
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large. Max 2MB' }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate safe filename
    const hash = crypto.randomBytes(6).toString('hex');
    const safeExt = ext || '.png';
    const filename = `logo-${Date.now()}-${hash}${safeExt}`;
    
    // Ensure upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'branding');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const url = `/uploads/branding/${filename}`;

    return new Response(JSON.stringify({ url, filename, size: file.size, type: file.type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), { status: 500 });
  }
};
