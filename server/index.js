import 'dotenv/config';
import express from 'express';
import { getWorks, getWork } from './notion.js';

const app = express();
const port = process.env.PORT || 3001;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/api/works', async (req, res) => {
  try {
    res.json({ works: await getWorks() });
  } catch (err) {
    console.error('GET /api/works error:', err.message);
    res.status(500).json({ error: 'Failed to fetch works' });
  }
});

app.get('/api/works/:id', async (req, res) => {
  try {
    res.json(await getWork(req.params.id));
  } catch (err) {
    console.error(`GET /api/works/${req.params.id} error:`, err.message);
    res.status(500).json({ error: 'Failed to fetch work detail' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
