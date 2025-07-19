// Types for the interaction data structure
interface SlideState {
  id: string;
  state: "active" | "disabled";
  status: "pending" | "completed";
}

interface LessonState {
  slides: SlideState[];
  currentSlideIndex: number;
  lessonTitle: string;
  lessonDescription: string;
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
) {
  console.log('[user-interactions] saveUserInteraction', { 
    userId, 
    lessonId, 
    interactionData 
  });
  
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
  return res.ok;
}
