// Add missing type definitions for Cloudflare Pages
interface KVNamespace {
  get(key: string, options?: { type: "text" | "json" | "arrayBuffer" | "stream"; cacheTtl?: number }): Promise<any>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expiration?: number; expirationTtl?: number; metadata?: any }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string; expiration?: number; metadata?: any }[]; list_complete: boolean; cursor?: string }>;
}

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

type PagesFunction<Env = unknown, Params extends string = any, Data extends Record<string, unknown> = Record<string, unknown>> = (context: EventContext<Env, Params, Data>) => Response | Promise<Response>;

interface Env {
  NAV_KV: KVNamespace;
  AUTH_PASSWORD: string;
  SITE_TITLE?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const { request, env } = context;

  // 獲取環境變量中的標題
  const defaultTitle = env.SITE_TITLE || '星雲導航';

  // 定義默認數據結構，與前端保持一致
  const DEFAULT_DATA = {
    config: {
      siteTitle: defaultTitle,
      redirects: []
    },
    bookmarks: []
  };

  // Helper for JSON responses
  const jsonResponse = (data: any, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

  // --- API: Login Verify ---
  if (url.pathname === '/api/auth' && request.method === 'POST') {
    try {
      const body: any = await request.json();
      if (body.password === env.AUTH_PASSWORD) {
        return jsonResponse({ token: "valid" });
      }
      return jsonResponse({ error: "Invalid password" }, 401);
    } catch (e) {
      return jsonResponse({ error: "Bad Request" }, 400);
    }
  }

  // --- API: Get Data ---
  if (url.pathname === '/api/data' && request.method === 'GET') {
    try {
      const data = await env.NAV_KV.get('nav_data', { type: 'json' });
      // 關鍵修復：如果 KV 為空，返回完整的 DEFAULT_DATA，而不是隻返回空數組
      return jsonResponse(data || DEFAULT_DATA);
    } catch (e) {
      return jsonResponse({ error: "KV Error" }, 500);
    }
  }

  // --- API: Save Data (Protected) ---
  if (url.pathname === '/api/data' && request.method === 'POST') {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader !== `Bearer ${env.AUTH_PASSWORD}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const body = await request.json();
      await env.NAV_KV.put('nav_data', JSON.stringify(body));
      return jsonResponse({ success: true });
    } catch (e) {
      return jsonResponse({ error: "Write Failed" }, 500);
    }
  }

  return new Response("Not Found", { status: 404 });
}