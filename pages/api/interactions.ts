import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API /api/interactions called:', req.method);
  if (req.method === 'GET') {
    // Fetch user interaction for a lesson
    const { userId, lessonId } = req.query;
    console.log('GET params:', { userId, lessonId });
    if (!userId || !lessonId) {
      console.log('Missing userId or lessonId');
      return res.status(400).json({ error: 'Missing userId or lessonId' });
    }
    try {
      const client = await clientPromise;
      const db = client.db('ast_lessons');
      const interaction = await db.collection('interactions').findOne({ userId, lessonId });
      console.log('GET found interaction:', interaction);
      if (!interaction) return res.status(404).json({ error: 'Not found' });
      res.status(200).json(interaction);
    } catch (error) {
      console.error('GET error:', error);
      res.status(500).json({ error: 'Failed to load interaction' });
    }
  } else if (req.method === 'POST') {
    // Save or update user interaction
    try {
      const { userId, lessonId, componentsState } = req.body;
      console.log('POST body:', { userId, lessonId, componentsState });
      if (!userId || !lessonId) {
        console.log('Missing userId or lessonId');
        return res.status(400).json({ error: 'Missing userId or lessonId' });
      }
      const client = await clientPromise;
      const db = client.db('ast_lessons');
      const result = await db.collection('interactions').updateOne(
        { userId, lessonId },
        { $set: { componentsState, lastUpdated: new Date() } },
        { upsert: true }
      );
      console.log('POST result:', result);
      res.status(200).json({ success: true, id: result.upsertedId || result.modifiedId });
    } catch (error) {
      console.error('POST error:', error);
      res.status(500).json({ error: 'Failed to save interaction' });
    }
  } else {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
