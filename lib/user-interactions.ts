// Types for the interaction data structure
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

// Utility for loading and saving user interactions
export async function fetchUserInteraction(userId: string, lessonId: string) {
  console.log('[user-interactions] fetchUserInteraction', { userId, lessonId });
  const res = await fetch(`/api/interactions?userId=${userId}&lessonId=${lessonId}`);
  if (!res.ok) return null;

  const data = await res.json();
  // Handle backward compatibility for older interaction data
  if (data && !data.lessonState) {
    return {
      componentsState: data.componentsState || {},
      lessonState: {
        slides: [],
        currentSlideIndex: 0,
        lessonTitle: '',
        lessonDescription: ''
      }
    };
  }
  return data;
}

export async function saveUserInteraction(
  userId: string,
  lessonId: string,
  interactionData: InteractionData
): Promise<{ success: boolean; error?: string }> {
  console.log('[user-interactions] saveUserInteraction', {
    userId,
    lessonId
  });

  try {
    const res = await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        lessonId,
        componentsState: interactionData.componentsState,
        lessonState: interactionData.lessonState
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMsg = errorData.details || errorData.error || `Server responded with ${res.status}`;
      console.error('[user-interactions] Save failed:', errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[user-interactions] Network/Fetch error:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}
