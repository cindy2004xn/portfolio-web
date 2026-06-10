import 'dotenv/config';
import express from 'express';
import { Client } from '@notionhq/client';

const app = express();
const port = process.env.PORT || 3001;
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

function parseCoverImage(richTextArr) {
  if (!richTextArr?.length) return null;
  const text = richTextArr.map(rt => rt.plain_text || '').join('');
  const match = text.match(/!\[.*?\]\((.+?)\)/);
  return match ? match[1] : null;
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
    coverImage: parseCoverImage(props['圖片']?.rich_text),
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

app.get('/api/works', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });
    res.json({ works: response.results.map(formatPage) });
  } catch (err) {
    console.error('GET /api/works error:', err.message);
    res.status(500).json({ error: 'Failed to fetch works' });
  }
});

app.get('/api/works/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [page, rawBlocks] = await Promise.all([
      notion.pages.retrieve({ page_id: id }),
      fetchBlocksRecursively(id),
    ]);
    const work = formatPage(page);
    work.blocks = rawBlocks.map(stripMeta);
    res.json(work);
  } catch (err) {
    console.error(`GET /api/works/${req.params.id} error:`, err.message);
    res.status(500).json({ error: 'Failed to fetch work detail' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
