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

// Key helper for offline local storage
function getOfflineStorageKey(userId: string, lessonId: string) {
  return `ast_interaction_${userId}_${lessonId}`;
}

// Utility for loading and saving user interactions
export async function fetchUserInteraction(userId: string, lessonId: string) {
  console.log('[user-interactions] fetchUserInteraction', { userId, lessonId });

  // 1. Try fetching from network if online
  if (typeof window !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch(`/api/interactions?userId=${userId}&lessonId=${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          // Cache successful network response locally for offline backup
          localStorage.setItem(getOfflineStorageKey(userId, lessonId), JSON.stringify(data));
          return data;
        }
      } else if (res.status === 404) {
        // Server explicitly states no interaction exists. Clear stale local storage cache!
        localStorage.removeItem(getOfflineStorageKey(userId, lessonId));
        return null;
      }
    } catch (e) {
      console.warn('[user-interactions] Network fetch failed, falling back to local storage:', e);
    }
  }

  // 2. Fallback to localStorage (offline mode or network failure)
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(getOfflineStorageKey(userId, lessonId));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log('[user-interactions] Restored interaction from offline storage');
        return parsed;
      } catch (err) {
        console.error('[user-interactions] Failed to parse cached interaction:', err);
      }
    }
  }

  return null;
}

export async function saveUserInteraction(
  userId: string,
  lessonId: string,
  interactionData: InteractionData
): Promise<{ success: boolean; error?: string }> {
  console.log('[user-interactions] saveUserInteraction', { userId, lessonId });

  // Always save locally first so user progress is 100% safe offline
  if (typeof window !== 'undefined') {
    localStorage.setItem(getOfflineStorageKey(userId, lessonId), JSON.stringify(interactionData));
  }

  // If online, post to server API
  if (typeof window !== 'undefined' && !navigator.onLine) {
    console.log('[user-interactions] Device is offline. Saved progress locally.');
    return { success: true };
  }

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
      console.warn('[user-interactions] Server save warning (saved locally):', errorMsg);
      return { success: true };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('[user-interactions] Saved locally due to network error:', err.message);
    return { success: true };
  }
}

// Auto-sync offline progress to backend when network returns
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('[user-interactions] Back online! Checking for unsynced local progress...');
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) keys.push(k);
      }

      for (const key of keys) {
        if (key.startsWith('ast_interaction_')) {
          const parts = key.split('_');
          if (parts.length >= 4) {
            const userId = parts[2];
            const lessonId = parts.slice(3).join('_');
            const dataStr = localStorage.getItem(key);
            if (dataStr && userId && lessonId) {
              try {
                const data = JSON.parse(dataStr);
                await fetch('/api/interactions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId,
                    lessonId,
                    componentsState: data.componentsState,
                    lessonState: data.lessonState
                  })
                });
                console.log(`[user-interactions] Successfully synced offline progress for lesson ${lessonId}`);
              } catch (e) {
                console.error(`[user-interactions] Failed to sync ${key}:`, e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[user-interactions] Error reading offline keys during online sync:', err);
    }
  });
}
