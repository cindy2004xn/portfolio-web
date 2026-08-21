/**
 * 建置時內容抓取：把 Notion 資料存成靜態 JSON、Notion 託管的圖片/影片
 * 下載到 public/content/，讓正式站完全不依賴 Notion API 與會過期的簽章網址。
 *
 * 產出（gitignored，每次 build 重新生成）：
 *   public/content/works.json        作品列表
 *   public/content/works/<id>.json   各作品內頁（含 blocks）
 *   public/content/images/           下載回來的圖片與影片
 */
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { getWorks, getWork, getNote, COURSE_NOTE_IDS } from './notion.js';

const OUT_DIR = path.resolve('public/content');
const IMG_DIR = path.join(OUT_DIR, 'images');
const SITE_URL = process.env.SITE_URL || 'https://portfolio-web-ten-dusky.vercel.app';

// 只有 Notion 託管的檔案（S3 簽章網址）需要下載；外部連結不會過期，保持原樣
function isNotionHosted(url) {
  try {
    const host = new URL(url).hostname;
    return host.endsWith('.amazonaws.com') || host.endsWith('notion-static.com');
  } catch {
    return false;
  }
}

// 這些格式會壓成 WebP；GIF（動圖）、SVG、影片等保留原檔
const COMPRESSIBLE = new Set(['.png', '.jpg', '.jpeg', '.webp', '.tiff', '.avif']);
const MAX_WIDTH = 1600; // 版面最寬約 850px，1600 足夠 2x retina
const WEBP_QUALITY = 82;

let bytesBefore = 0;
let bytesAfter = 0;

async function download(url, name) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`下載失敗 HTTP ${res.status}：${url.slice(0, 100)}`);
  const ext = path.extname(new URL(url).pathname).toLowerCase() || '.jpg';
  let buf = Buffer.from(await res.arrayBuffer());
  let file = `${name}${ext}`;

  if (COMPRESSIBLE.has(ext)) {
    bytesBefore += buf.length;
    try {
      buf = await sharp(buf)
        .rotate() // 套用 EXIF 方向
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      file = `${name}.webp`;
    } catch (err) {
      console.warn(`  ⚠ 壓縮失敗，保留原檔（${name}${ext}）：${err.message}`);
    }
    bytesAfter += buf.length;
  }

  await fs.writeFile(path.join(IMG_DIR, file), buf);
  return `/content/images/${file}`;
}

// 走訪 blocks，把 Notion 託管的 image/video 檔案換成本地路徑
async function localizeBlocks(blocks) {
  for (const block of blocks) {
    const d = block[block.type];
    if ((block.type === 'image' || block.type === 'video') && d?.type === 'file' && d.file?.url) {
      d.file.url = await download(d.file.url, block.id);
    }
    if (block.children?.length) await localizeBlocks(block.children);
  }
}

async function main() {
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(IMG_DIR, { recursive: true });
  await fs.mkdir(path.join(OUT_DIR, 'works'), { recursive: true });
  await fs.mkdir(path.join(OUT_DIR, 'notes'), { recursive: true });

  const works = await getWorks();
  console.log(`共 ${works.length} 件作品`);

  for (const work of works) {
    if (work.coverImage && isNotionHosted(work.coverImage)) {
      work.coverImage = await download(work.coverImage, `${work.id}-cover`);
    }

    const detail = await getWork(work.id);
    detail.coverImage = work.coverImage; // 沿用已本地化的封面
    await localizeBlocks(detail.blocks);
    await fs.writeFile(
      path.join(OUT_DIR, 'works', `${work.id}.json`),
      JSON.stringify(detail)
    );
    console.log(`✓ ${work.title}（${detail.blocks.length} blocks）`);
  }

  await fs.writeFile(path.join(OUT_DIR, 'works.json'), JSON.stringify({ works }));

  // 課程心得（獨立 Notion 頁面，內容呈現比照作品內頁）
  const notes = [];
  for (const noteId of COURSE_NOTE_IDS) {
    const note = await getNote(noteId);
    await localizeBlocks(note.blocks);
    await fs.writeFile(
      path.join(OUT_DIR, 'notes', `${note.id}.json`),
      JSON.stringify(note)
    );
    notes.push({ id: note.id, title: note.title });
    console.log(`✓ 課程心得：${note.title}（${note.blocks.length} blocks）`);
  }
  await fs.writeFile(path.join(OUT_DIR, 'notes.json'), JSON.stringify({ notes }));

  // sitemap.xml（landing + 作品列表 + 各作品頁 + 課程心得）
  const urls = [
    `  <url><loc>${SITE_URL}/</loc></url>`,
    `  <url><loc>${SITE_URL}/works</loc></url>`,
    ...works.map(w => `  <url><loc>${SITE_URL}/work/${w.id}</loc><lastmod>${w.date}</lastmod></url>`),
    ...notes.map(n => `  <url><loc>${SITE_URL}/note/${n.id}</loc></url>`),
  ];
  await fs.writeFile(
    path.resolve('public/sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  );

  const mb = n => (n / 1048576).toFixed(1);
  if (bytesBefore > 0) {
    console.log(`圖片壓縮：${mb(bytesBefore)}MB → ${mb(bytesAfter)}MB（省 ${Math.round((1 - bytesAfter / bytesBefore) * 100)}%）`);
  }
  console.log(`完成 → ${path.relative(process.cwd(), OUT_DIR)}/ + sitemap.xml`);
}

main().catch(err => {
  console.error('內容抓取失敗：', err);
  process.exit(1); // build 失敗即中止部署，線上維持前一版
});
