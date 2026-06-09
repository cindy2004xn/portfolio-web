import 'dotenv/config';
import express from 'express';
import { Client } from '@notionhq/client';
import { blocksToMarkdown } from './notionParser.js';

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

function formatPage(page) {
  const props = page.properties;
  return {
    id: page.id,
    title: props['作品名稱']?.title?.map(t => t.plain_text).join('') || '',
    tags: props['tag']?.multi_select?.map(t => t.name) || [],
    type: props['作品類型']?.select?.name || '',
    coverImage: parseCoverImage(props['圖片']?.rich_text),
    createdTime: page.created_time,
    display: {
      card: {
        type: props['卡片顯示類型']?.checkbox ?? true,
        tags: props['卡片顯示Tag']?.checkbox ?? true,
      },
      page: {
        type: props['作品頁顯示類型']?.checkbox ?? true,
        date: props['作品頁顯示日期']?.checkbox ?? false,
        tags: props['作品頁顯示Tag']?.checkbox ?? true,
      },
    },
  };
}

app.get('/api/works', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: { property: 'published', checkbox: { equals: true } },
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
    const [page, blocksRes] = await Promise.all([
      notion.pages.retrieve({ page_id: id }),
      notion.blocks.children.list({ block_id: id }),
    ]);
    const work = formatPage(page);
    work.content = blocksToMarkdown(blocksRes.results);
    res.json(work);
  } catch (err) {
    console.error(`GET /api/works/${req.params.id} error:`, err.message);
    res.status(500).json({ error: 'Failed to fetch work detail' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
