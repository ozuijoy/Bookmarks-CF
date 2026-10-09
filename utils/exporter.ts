import { Bookmark, KVData } from '../types';

export const generateNetscapeHTML = (bookmarks: Bookmark[]): string => {
  const now = Math.floor(Date.now() / 1000);
  
  // Group bookmarks by category
  const groups: Record<string, Bookmark[]> = {};
  bookmarks.forEach(b => {
    const cat = b.category || '未分類';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(b);
  });

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  for (const [category, items] of Object.entries(groups)) {
    html += `    <DT><H3 ADD_DATE="${now}" LAST_MODIFIED="${now}">${category}</H3>\n`;
    html += `    <DL><p>\n`;
    
    items.forEach(b => {
      const iconAttr = b.icon ? ` ICON="${b.icon}"` : '';
      html += `        <DT><A HREF="${b.url}" ADD_DATE="${Math.floor(b.createdAt / 1000)}" ${iconAttr}>${b.title}</A>\n`;
    });

    html += `    </DL><p>\n`;
  }

  html += `</DL><p>`;
  return html;
};

export const downloadBookmarks = (bookmarks: Bookmark[]) => {
  const html = generateNetscapeHTML(bookmarks);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bookmarks-cf-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadBackupJSON = (data: KVData) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bookmarks-cf-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};