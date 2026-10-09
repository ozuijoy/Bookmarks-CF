// Add missing type definitions for Cloudflare Pages
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
  REDIRECTS: string; // JSON string in environment variables
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  
  // 1. 解析重定向配置 (從環境變量 REDIRECTS 讀取 JSON)
  let redirects: Record<string, string> | null = null;
  try {
    if (context.env.REDIRECTS) {
      redirects = JSON.parse(context.env.REDIRECTS);
    }
  } catch (e) {
    // console.error("Failed to parse REDIRECTS json");
  }

  // 如果沒有配置，直接放行
  if (!redirects || Object.keys(redirects).length === 0) {
    return context.next();
  }

  // 2. 模式一：路徑重定向 (Path-based) - 優先級高，支持所有域名 (包括 pages.dev)
  // 示例: 訪問 https://nav.pages.dev/emby -> 跳轉到 https://emby.xxx.com
  // 邏輯: 提取路徑的第一段作為 Key
  
  // 排除系統路徑和資源
  if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/assets/')) {
    // 提取 Key: /emby/some-path -> emby
    const pathKey = decodeURIComponent(url.pathname.slice(1).split('/')[0]);
    
    if (pathKey && redirects[pathKey]) {
      return Response.redirect(redirects[pathKey], 302);
    }
  }

  // 3. 模式二：子域名重定向 (Subdomain-based) - 僅限自定義域名
  // 示例: 訪問 https://emby.your-domain.com -> 跳轉到 https://emby.xxx.com
  // 注意: Cloudflare Pages 的默認域名 (*.pages.dev) 不支持隨意使用子域名，因此此處將其排除，避免與項目名衝突。
  
  if (!url.hostname.includes('pages.dev')) {
    const hostnameParts = url.hostname.split('.');
    // 簡單的判斷邏輯：至少有三段 (sub.domain.com)
    if (hostnameParts.length >= 3) {
      const prefix = hostnameParts[0].toLowerCase();
      
      // 排除 www 和 nav 等常見前綴
      if (prefix !== 'www' && prefix !== 'nav') {
        if (redirects[prefix]) {
           return Response.redirect(redirects[prefix], 302);
        }
      }
    }
  }

  // 沒有命中規則，繼續處理請求（返回前端頁面）
  return context.next();
}