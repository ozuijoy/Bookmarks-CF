# 星雲導航 · Bookmarks-CF

基於 Cloudflare Pages + KV 構建的未來風導航頁，支持 React 前端、服務端 Functions API、密碼認證、拖拽排序、天氣Widget 等特性。

## ✨ 功能特性

- 🔐 密碼認證保護（服務端驗證，Bearer Token 認證機制）
- 🗂️ 分類管理：自定義分組、拖拽排序、分組折疊
- 📌 書籤固定：Pin 常用站點到頂部
- 🎨 卡片模式切換：標準 / 大卡片 / 小卡片
- 🌤️ 天氣 Widget：接入 Open-Meteo 免費天氣 API
- 💬 每日一言：接入一言 API
- 📝 便簽 Widget：支持本地筆記
- 🔗 URL 重定向：自定義短鏈路重定向
- 📥 備份/恢復：支持 JSON 備份和瀏覽器 HTML 導出
- 🖥️ 響應式設計：適配桌面和移動設備

## 🛠️ 技術棧

| 組件 | 技術 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 構建工具 | Vite 6 |
| 樣式方案 | TailwindCSS 3 |
| 拖拽庫 | @dnd-kit |
| 後端運行時 | Cloudflare Pages Functions |
| 數據存儲 | Cloudflare KV |
| 部署平臺 | Cloudflare Pages |

## 📂 項目結構

```
Bookmarks-CF/
├── App.tsx                    # 主應用組件
├── components/                # UI 組件
│   ├── Card.tsx               # 書籤卡片
│   ├── Header.tsx             # 頂部導航
│   ├── Footer.tsx             # 底部信息
│   ├── LoginScreen.tsx        # 登錄界面
│   └── widgets/               # Widget 組件（天氣、一言、便簽）
├── hooks/
│   ├── useAuth.ts             # 認證 Hook
│   └── useData.ts             # 數據管理 Hook
├── services/
│   └── storage.ts             # 存儲服務（雲端/本地雙模式）
├── functions/
│   └── api/
│       └── [[catchall]].ts    # Cloudflare Pages API（認證、數據讀寫）
├── types.ts                   # TypeScript 類型定義
├── utils/                     # 工具函數（導出、導入）
└── package.json
```

## ⚙️ 環境配置

### 1. 安裝依賴

```bash
npm install
```

### 2. 配置環境變量

所有環境變量請在 **Cloudflare Dashboard → Workers & Pages → 你的項目 → Settings → Variables and Secrets** 中設定：

| 變量名 | 必填 | 類型 | 說明 |
|--------|------|------|------|
| `AUTH_PASSWORD` | ✅ | Secret | 站點訪問密碼 |
| `SITE_TITLE` | ❌ | Variable | 站點標題，默認 `星雲導航` |
| `REDIRECTS` | ❌ | Variable | URL 重定向規則（JSON 字符串） |

> ⚠️ **安全提示**：所有敏感值請在 Cloudflare Dashboard 中設定，切勿寫入代碼或提交到 Git 倉庫。

### 3. 本地開發

```bash
npm run dev
```

> 本地開發模式下，認證功能需要雲端 API 支持。如僅需測試前端界面，可在 `services/storage.ts` 中將 `USE_CLOUD_API` 設為 `false`，並在 `.env` 中設定 `VITE_DEV_PASSWORD`。

## 🚀 部署到 Cloudflare Pages

### 方法一：通過 GitHub 連接（推薦）

1. 將代碼推送到 GitHub 倉庫
2. 在 Cloudflare Dashboard → Pages → Create a project → Connect to Git
3. 選擇你的倉庫，配置如下：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### 方法二：通過 Wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy dist --project-name bookmarks-cf
```

### 配置 Cloudflare KV

1. 在 Cloudflare Dashboard → Workers & Pages → KV Storage → Create a namespace
2. 記錄 Namespace ID
3. 在 Pages 項目的 **Settings → Bindings** 中添加 KV 綁定：
   - **Name**: `NAV_KV`
   - **Type**: `KV Namespace`
   - **KV Namespace**: 選擇剛才創建的命名空間
4. 在 **Settings → Variables and Secrets** 中添加 Secrets：
   - `AUTH_PASSWORD`：你的訪問密碼

> ⚠️ **安全提示**：KV Namespace ID 是敏感信息，請通過 Dashboard 綁定，不要硬編碼到任何配置文件中。

### 配置環境變量（可選）

| 變量名 | 類型 | 示例 |
|--------|------|------|
| `SITE_TITLE` | Variable | `星雲導航` |
| `REDIRECTS` | Variable | `{"emby":"https://emby.example.com"}` |

## 🔐 安全說明

### 認證機制

1. 前端提交密碼到 `/api/auth`
2. 服務端與 `env.AUTH_PASSWORD` 比對
3. 驗證通過後返回 token，後續請求通過 `Authorization: Bearer <password>` 頭認證

### 安全最佳實踐

- ✅ `AUTH_PASSWORD` 通過 Cloudflare Dashboard Secrets 設置，不明文存儲在代碼中
- ✅ KV Namespace 通過 Dashboard Bindings 綁定，不硬編碼到配置文件中
- ✅ `.env` 文件已加入 `.gitignore`，不會提交到版本控制
- ✅ Bearer Token 認證保護數據寫入接口

## 📁 數據備份與恢復

### 導出備份
- **JSON 備份**：點擊 Header 的導出按鈕，下載 JSON 文件
- **HTML 導出**：導出為瀏覽器可導入的書籤 HTML 文件

### 恢復備份
- 點擊 Header 的導入按鈕，上傳 JSON 或 HTML 備份文件
- JSON 備份支持全量恢復（配置 + 書籤）
- HTML 文件支持僅導入書籤列表

## 🌤️ 天氣 Widget 配置

天氣 Widget 使用 Open-Meteo 免費 API（無需 API Key），通過 IP 定位獲取當前城市天氣。

## 📝 License

MIT License

## 📮 聯繫

如有問題或建議，請提交 Issue。
