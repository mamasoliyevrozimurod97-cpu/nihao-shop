import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const fileId = searchParams.get('id');

    if (!fileId) {
      return new NextResponse('File ID is required', { status: 400 });
    }

    // 1. Get file path from Telegram
    const pathRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const pathData = await pathRes.json();

    if (!pathData.ok) {
      return new NextResponse('Failed to get file path', { status: 404 });
    }

    const filePath = pathData.result.file_path;

    // 2. Fetch the actual file
    const fileRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);
    
    if (!fileRes.ok) {
        return new NextResponse('Failed to download file', { status: 500 });
    }

    const buffer = await fileRes.arrayBuffer();

    // 3. Serve the file with correct headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': fileRes.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

  } catch (error) {
    console.error('File Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
