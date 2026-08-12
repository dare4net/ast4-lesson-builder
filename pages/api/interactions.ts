import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

// Custom config for Next.js API route to handle larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Types from user-interactions.ts
interface SlideState {
  id: string;
  state: "active" | "disabled";
  status: "uncompleted" | "completed";
}

interface LessonState {
  slides: SlideState[];
  currentSlideIndex: number;
  lessonTitle: string;
  lessonDescription: string;
  progress?: number;
  score?: number;
  totalScore?: number;
}

interface InteractionData {
  componentsState: Record<string, any>;
  lessonState: LessonState;
}

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

      // Handle backward compatibility
      if (!interaction.lessonState) {
        interaction.lessonState = {
          slides: [],
          currentSlideIndex: 0,
          lessonTitle: '',
          lessonDescription: ''
        };
      }

      res.status(200).json(interaction);
    } catch (error) {
      console.error('GET error:', error);
      res.status(500).json({ error: 'Failed to load interaction' });
    }
  } else if (req.method === 'POST') {
    // Save or update user interaction
    try {
      const { userId, lessonId, componentsState, lessonState } = req.body as {
        userId: string;
        lessonId: string;
        componentsState: Record<string, any>;
        lessonState: LessonState;
      };

      console.log('POST body:', { userId, lessonId, componentsState, lessonState });

      if (!userId || !lessonId) {
        return res.status(400).json({ error: 'Missing userId or lessonId' });
      }

      const client = await clientPromise;
      const db = client.db('ast_lessons');
      const mainDb = client.db('afterschooltech');

      // Fetch existing interaction to preserve any tutor-marked component states.
      // Student auto-saves must NOT overwrite marks a tutor has already applied.
      const existing = await db.collection('interactions').findOne({ userId, lessonId });
      let mergedComponentsState = { ...componentsState };
      if (existing?.componentsState) {
        for (const [compId, existingCompState] of Object.entries(existing.componentsState as Record<string, any>)) {
          if (existingCompState?.wasReset === true && componentsState[compId]?.isSubmitted !== true) {
            // Component was reset by tutor: enforce reset state unless student submits a new response
            mergedComponentsState[compId] = existingCompState;
          } else if (existingCompState?.tutorMarked === true) {
            // Preserve all tutor-applied fields, including isApproved and status
            mergedComponentsState[compId] = {
              ...(componentsState[compId] || {}),
              tutorMarked: true,
              score: existingCompState.score,
              isApproved: Boolean(existingCompState.isApproved),
              isPendingMarking: false,
              status: 'completed',
              markedBy: existingCompState.markedBy,
              markedAt: existingCompState.markedAt,
            };
          }
        }
      }

      const result = await db.collection('interactions').updateOne(
        { userId, lessonId },
        {
          $set: {
            componentsState: mergedComponentsState,
            lessonState,
            lastActiveAt: new Date(),
            lastUpdated: new Date()
          }
        },
        { upsert: true }
      );

      // Also update last_activity in program_registrations for real-time telemetry
      try {
        await mainDb.collection('program_registrations').updateMany(
          { user_id: userId }, // Best effort: update all active for this user
          { $set: { last_activity: new Date() } }
        );
      } catch (err) {
        console.error('[TELEMETRY] Failed to update telemetry last_activity:', err);
      }

      res.status(200).json({ success: true, id: result.upsertedId });
    } catch (error: any) {
      console.error('POST error in /api/interactions:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      res.status(500).json({
        error: 'Failed to save interaction',
        details: error.message
      });
    }
  } else {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
