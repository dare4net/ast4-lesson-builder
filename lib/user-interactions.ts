import { apiClient } from './api-client'
import { interactionStorageKey } from './lesson-ref'
import { tabSync } from './tab-sync'

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
  attemptsMap?: Record<string, { firstAttemptCount: number | null; bestAttemptCount: number | null }>;
  version?: number;
}

export function getOfflineStorageKey(userId: string, lessonId: string) {
  return interactionStorageKey(userId, lessonId);
}

function persistLocally(userId: string, lessonId: string, interactionData: InteractionData): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(getOfflineStorageKey(userId, lessonId), JSON.stringify(interactionData));
    return true;
  } catch (err) {
    console.error("[user-interactions] Failed to persist locally:", err);
    return false;
  }
}

function axiosStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "response" in err) {
    return (err as { response?: { status?: number } }).response?.status;
  }
  return undefined;
}

function axiosErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const ax = err as { response?: { data?: { error?: string; details?: string } }; message?: string };
    return ax.response?.data?.details || ax.response?.data?.error || ax.message || "Network error";
  }
  return "Network error";
}

export async function fetchUserInteraction(userId: string, lessonId: string) {
  console.log("[user-interactions] fetchUserInteraction", { userId, lessonId });

  if (typeof window !== "undefined" && navigator.onLine) {
    try {
      const data = await apiClient.interactions.get(lessonId, userId);
      if (data) {
        localStorage.setItem(getOfflineStorageKey(userId, lessonId), JSON.stringify(data));
        return data;
      }
    } catch (e) {
      if (axiosStatus(e) === 404) {
        localStorage.removeItem(getOfflineStorageKey(userId, lessonId));
        return null;
      }
      console.warn("[user-interactions] Network fetch failed, falling back to local storage:", e);
    }
  }

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(getOfflineStorageKey(userId, lessonId));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log("[user-interactions] Restored interaction from offline storage");
        return parsed;
      } catch (err) {
        console.error("[user-interactions] Failed to parse cached interaction:", err);
      }
    }
  }

  return null;
}

export async function saveUserInteraction(
  userId: string,
  lessonId: string,
  interactionData: InteractionData
): Promise<{ success: boolean; error?: string; conflict?: boolean; version?: number; suppressed?: boolean }> {
  console.log("[user-interactions] saveUserInteraction", { userId, lessonId });

  if (tabSync.shouldSuppressWrite(userId, lessonId)) {
    return { success: true, suppressed: true };
  }

  const version = interactionData.version ?? 0;
  tabSync.publishInteraction(userId, lessonId, version);

  const savedLocally = persistLocally(userId, lessonId, interactionData);

  if (typeof window !== "undefined" && !navigator.onLine) {
    if (!savedLocally) {
      return { success: false, error: "Offline and local save failed" };
    }
    console.log("[user-interactions] Device is offline. Saved progress locally.");
    return { success: true, version };
  }

  try {
    const data = await apiClient.interactions.save({
      userId,
      lessonId,
      componentsState: interactionData.componentsState,
      lessonState: interactionData.lessonState,
      attemptsMap: interactionData.attemptsMap,
      version,
    });
    return { success: true, version: data?.version ?? version + 1 };
  } catch (err: unknown) {
    if (axiosStatus(err) === 409) {
      const conflictVersion = (err as { response?: { data?: { version?: number } } }).response?.data?.version;
      tabSync.noteRemote(userId, lessonId, conflictVersion ?? version);
      return { success: false, error: "Version conflict", conflict: true, version: conflictVersion };
    }
    const errorMsg = axiosErrorMessage(err);
    console.warn("[user-interactions] Server save failed (kept locally for retry):", errorMsg);
    return { success: false, error: errorMsg };
  }
}
