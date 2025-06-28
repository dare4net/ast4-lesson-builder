// Utility for loading and saving user interactions
export async function fetchUserInteraction(userId: string, lessonId: string) {
  console.log('[user-interactions] fetchUserInteraction', { userId, lessonId });
  const res = await fetch(`/api/interactions?userId=${userId}&lessonId=${lessonId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function saveUserInteraction(userId: string, lessonId: string, componentsState: any) {
  console.log('[user-interactions] saveUserInteraction', { userId, lessonId, componentsState });
  const res = await fetch('/api/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, lessonId, componentsState })
  });
  return res.ok;
}
