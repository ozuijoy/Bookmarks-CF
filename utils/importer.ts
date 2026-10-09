import { Bookmark, KVData } from '../types';

export const parseBookmarksHTML = (htmlContent: string): Bookmark[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const links = doc.getElementsByTagName('a');
  
  const bookmarks: Bookmark[] = [];
  
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const url = link.getAttribute('href');
    const title = link.textContent;
    
    // 兼容 ICON 或 icon 屬性，並處理 Base64 字符串
    // 某些瀏覽器導出的 Base64 可能包含換行符，需要清理
    let icon = link.getAttribute('icon') || link.getAttribute('ICON');
    if (icon) {
      icon = icon.trim();
    }
    
    // Attempt to find category (parent folder)
    let category = '導入';
    const dt = link.parentElement;
    if (dt && dt.tagName === 'DT') {
      const dl = dt.parentElement;
      if (dl && dl.tagName === 'DL') {
        const folderTitle = dl.previousElementSibling;
        if (folderTitle && folderTitle.tagName === 'H3') {
          category = folderTitle.textContent || '導入';
        }
      }
    }

    if (url && title) {
      bookmarks.push({
        id: crypto.randomUUID(),
        title: title.trim(),
        url: url,
        icon: icon || undefined,
        category: category,
        createdAt: Date.now()
      });
    }
  }
  return bookmarks;
};

// Check if string is likely JSON
export const isJSON = (str: string) => {
    try {
        const o = JSON.parse(str);
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }
    return false;
};

export const parseBackupData = (content: string): KVData | Bookmark[] | null => {
    const json = isJSON(content);
    
    // Case 1: Full Backup JSON
    if (json && json.bookmarks && json.config) {
        return json as KVData;
    }
    
    // Case 2: Simple Array JSON (Unlikely but possible)
    if (Array.isArray(json)) {
        // Basic check if it looks like bookmarks
        return json as Bookmark[];
    }

    // Case 3: HTML File
    if (content.trim().toLowerCase().startsWith('<!doctype netscape') || content.includes('<DL>')) {
        return parseBookmarksHTML(content);
    }

    return null;
};