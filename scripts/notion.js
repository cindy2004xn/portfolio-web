import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// 「圖片」屬性可能是 files（上傳/外部檔案）或舊的 rich_text（markdown 圖片語法）
function parseCoverImage(prop) {
  if (!prop) return null;
  // files 型別：取第一個檔案的 URL
  if (prop.files?.length) {
    const f = prop.files[0];
    return (f.type === 'external' ? f.external?.url : f.file?.url) || null;
  }
  // 舊格式：rich_text 內嵌 ![](url)
  if (prop.rich_text?.length) {
    const text = prop.rich_text.map(rt => rt.plain_text || '').join('');
    const match = text.match(/!\[.*?\]\((.+?)\)/);
    return match ? match[1] : null;
  }
  return null;
}

function richTextStr(richTextArr) {
  return richTextArr?.map(t => t.plain_text || '').join('') || '';
}

// Block types whose children need to be recursively fetched
const NEEDS_CHILDREN = new Set([
  'toggle', 'quote', 'callout',
  'bulleted_list_item', 'numbered_list_item',
  'column_list', 'column',
  'table',
  'synced_block',
]);

async function fetchBlocksRecursively(blockId, depth = 0) {
  if (depth > 4) return [];
  const blocks = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const block of res.results) {
      if (block.has_children && NEEDS_CHILDREN.has(block.type)) {
        block.children = await fetchBlocksRecursively(block.id, depth + 1);
      }
      blocks.push(block);
    }
    cursor = res.next_cursor;
  } while (cursor);
  return blocks;
}

// Strip Notion metadata, keep only content fields
function stripMeta(block) {
  const { id, type, has_children } = block;
  const out = { id, type, has_children: has_children ?? false };
  if (block[type]) out[type] = block[type];
  if (block.children) out.children = block.children.map(stripMeta);
  return out;
}

const FALLBACK_RATIOS = ['4 / 3', '3 / 4', '4 / 3', '1 / 1', '4 / 5', '16 / 10'];

function formatPage(page, index = 0) {
  const props = page.properties;
  const createdDate = new Date(page.created_time);
  return {
    id: page.id,
    title: props['作品名稱']?.title?.map(t => t.plain_text).join('') || '',
    tags: props['tag']?.multi_select?.map(t => t.name) || [],
    // 「作品類型」rich_text 實際存的是委託方/客戶（如「華碩」）；舊欄名 委託方 留作 fallback
    client: richTextStr(props['作品類型']?.rich_text)
      || props['委託方']?.select?.name
      || richTextStr(props['委託方']?.rich_text)
      || '',
    year: richTextStr(props['作品年份']?.rich_text)
      || props['年份']?.select?.name
      || richTextStr(props['年份']?.rich_text)
      || createdDate.getFullYear().toString(),
    date: props['日期']?.date?.start
      || createdDate.toISOString().slice(0, 10),
    ratio: props['比例']?.select?.name || FALLBACK_RATIOS[index % FALLBACK_RATIOS.length],
    coverImage: parseCoverImage(props['圖片']),
    createdTime: page.created_time,
    display: {
      card: {
        tags:   props['卡片顯示Tag']?.checkbox ?? true,
        client: (props['卡片顯示類型'] ?? props['卡片顯示委託方'])?.checkbox ?? true,
        year:   (props['卡片顯示年份'])?.checkbox ?? true,
      },
      page: {
        tags:   props['作品頁顯示Tag']?.checkbox ?? true,
        date:   props['作品頁顯示日期']?.checkbox ?? false,
        client: (props['作品頁顯示類型'] ?? props['作品頁顯示委託方'])?.checkbox ?? true,
      },
    },
  };
}

export async function getWorks() {
  const pages = [];
  let cursor;
  do {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      start_cursor: cursor,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return pages.map(formatPage);
}

export async function getWork(id) {
  const [page, rawBlocks] = await Promise.all([
    notion.pages.retrieve({ page_id: id }),
    fetchBlocksRecursively(id),
  ]);
  const work = formatPage(page);
  work.blocks = rawBlocks.map(stripMeta);
  return work;
}

// 課程心得：獨立於作品資料庫之外的 Notion 頁面（來源為「人生筆記資料庫」），
// 以固定 ID 清單抓取；陣列順序即前台卡片顯示順序。要增減文章改這裡即可。
export const COURSE_NOTE_IDS = [
  '3afaa7a7-8108-804e-af73-d082ed673ce8', // 金融 x AI：導入策略、工作流整合與資安治理思辨
  '3afaa7a7-8108-8075-82fb-d840a3db1488', // 金融 x 數位資產：從傳統機制到 Web3 與 AI 的金融轉移
];

// 從 page 物件取標題：找型別為 title 的屬性，不綁定欄名（跨資料庫通用）
function pageTitle(page) {
  const titleProp = Object.values(page.properties || {}).find(p => p?.type === 'title');
  return richTextStr(titleProp?.title) || '';
}

// 課程心得內頁：只需標題與 blocks，內容呈現比照作品內頁
export async function getNote(id) {
  const [page, rawBlocks] = await Promise.all([
    notion.pages.retrieve({ page_id: id }),
    fetchBlocksRecursively(id),
  ]);
  return {
    id: page.id,
    title: pageTitle(page),
    blocks: rawBlocks.map(stripMeta),
  };
}
