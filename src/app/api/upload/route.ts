// 文件路径: src/app/api/upload/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const customKey = request.headers.get('x-custom-key');
    if (!customKey || !/^[a-zA-Z0-9-_]+$/.test(customKey) || customKey.length < 4) {
      return NextResponse.json(
        { error: 'Invalid alias/key. It must be 4+ characters and only contain letters, numbers, -, and _.' },
        { status: 400 }
      );
    }

    const configContent = await request.text();
    if (!configContent || configContent.length < 10) {
      return NextResponse.json({ error: 'File content is empty or too short.' }, { status: 400 });
    }

    // 直接存储用户上传的原始文本，不再做任何处理
    await kv.set(customKey, configContent);
    await kv.expire(customKey, 315360000); // 10年过期

    const subscriptionUrl = `${new URL(request.url).origin}/api/${customKey}`;
    
    // 确保返回一个包含URL的JSON对象
    return NextResponse.json({ url: subscriptionUrl });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process upload.' }, { status: 500 });
  }
}