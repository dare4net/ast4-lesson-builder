import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid userId' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('ast_lessons');
    const interactions = await db.collection('interactions')
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    if (!interactions.length) {
      return res.status(200).json([]);
    }

    const lessonIds = interactions.map(i => i.lessonId);
    const lessons = await db.collection('lessons')
      .find({ id: { $in: lessonIds } })
      .toArray();
    const lessonMap = Object.fromEntries(lessons.map(l => [l.id, l]));

    const result = interactions.map(interaction => {
      const lesson = lessonMap[interaction.lessonId];
      return {
        lessonId: interaction.lessonId,
        title: lesson?.title || 'Untitled',
        description: lesson?.description || '',
        completed: !!interaction.completed,
        lastOpened: interaction.updatedAt || interaction.createdAt,
        score: interaction.componentsState?.score || 0,
        totalPossible: interaction.componentsState?.totalPossible || 0,
      };
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user lessons' });
  }
}
