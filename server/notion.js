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
    client: props['委託方']?.select?.name
      || richTextStr(props['委託方']?.rich_text)
      || props['作品類型']?.select?.name
      || '',
    year: props['年份']?.select?.name
      || props['年份']?.rich_text?.map(t => t.plain_text).join('')
      || createdDate.getFullYear().toString(),
    date: props['日期']?.date?.start
      || createdDate.toISOString().slice(0, 10),
    ratio: props['比例']?.select?.name || FALLBACK_RATIOS[index % FALLBACK_RATIOS.length],
    coverImage: parseCoverImage(props['圖片']),
    createdTime: page.created_time,
    display: {
      card: {
        tags:   props['卡片顯示Tag']?.checkbox ?? true,
        client: props['卡片顯示委託方']?.checkbox ?? true,
        year:   props['卡片顯示年份']?.checkbox ?? true,
      },
      page: {
        tags:   props['作品頁顯示Tag']?.checkbox ?? true,
        date:   props['作品頁顯示日期']?.checkbox ?? false,
        client: props['作品頁顯示委託方']?.checkbox ?? true,
      },
    },
  };
}

export async function getWorks() {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  });
  return response.results.map(formatPage);
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
