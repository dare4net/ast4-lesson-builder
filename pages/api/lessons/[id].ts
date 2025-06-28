import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId } = req.body;
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing lesson id' });
    }
    try {
      const client = await clientPromise;
      const db = client.db('ast_lessons');
      const lesson = await db.collection('lessons').findOne({ id: id });
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }
      let interaction = null;
      if (userId) {
        interaction = await db.collection('interactions').findOne({ userId, lessonId: id });
      }
      res.status(200).json({ lesson, interaction });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load lesson or interaction' });
    }
  } else if (req.method === 'GET') {
    // fallback for GET requests (no userId)
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing lesson id' });
    }
    try {
      const client = await clientPromise;
      const db = client.db('ast_lessons');
      const lesson = await db.collection('lessons').findOne({ id: id });
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }
      res.status(200).json({ lesson });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load lesson' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
