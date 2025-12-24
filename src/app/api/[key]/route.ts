// 文件路径: src/app/api/[key]/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const revalidate = 0; // 禁用缓存

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // Next.js 15 中，params 是一个 Promise，必须 await
    const { key } = await params;

    if (!key) {
      return new NextResponse('Invalid key provided.', { status: 400 });
    }

    const decodedKey = decodeURIComponent(key);
    const config = await kv.get<string>(decodedKey);

    if (config === null) {
      return new NextResponse('Config not found. Please check your alias/key.', { status: 404 });
    }

    // --- 最终的、决定性的改动 ---
    // 我们只返回最纯粹的内容和最基本的 Content-Type 头
    // 完全移除引起问题的 Content-Disposition 头
    return new Response(config, {
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
    });
    // ----------------------------

  } catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('An unknown error occurred:', error);
    }
    return new NextResponse('Internal server error.', { status: 500 });
  }
}
