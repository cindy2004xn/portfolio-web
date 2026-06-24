import { getWorks } from '../server/notion.js';

export default async function handler(req, res) {
  try {
    res.status(200).json({ works: await getWorks() });
  } catch (err) {
    console.error('GET /api/works error:', err.message);
    res.status(500).json({ error: 'Failed to fetch works' });
  }
}
