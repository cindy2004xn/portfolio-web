import { getWork } from '../../server/notion.js';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    res.status(200).json(await getWork(id));
  } catch (err) {
    console.error(`GET /api/works/${id} error:`, err.message);
    res.status(500).json({ error: 'Failed to fetch work detail' });
  }
}
