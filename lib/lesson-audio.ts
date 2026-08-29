const PREFS_KEY = 'ast-feedback-prefs'

export interface LessonAudioPrefs {
  enabled: boolean
  volume: number
}

type PrefsListener = (prefs: LessonAudioPrefs) => void

function clampVolume(volume: number) {
  return Math.max(0, Math.min(1, volume))
}

function readStoredPrefs(): LessonAudioPrefs {
  if (typeof window === 'undefined') {
    return { enabled: true, volume: 0.5 }
  }
  try {
    const raw = window.localStorage.getItem(PREFS_KEY)
    if (!raw) return { enabled: true, volume: 0.5 }
    const parsed = JSON.parse(raw) as { isSoundEnabled?: boolean; soundVolume?: number }
    return {
      enabled: typeof parsed.isSoundEnabled === 'boolean' ? parsed.isSoundEnabled : true,
      volume: typeof parsed.soundVolume === 'number' ? clampVolume(parsed.soundVolume) : 0.5,
    }
  } catch {
    return { enabled: true, volume: 0.5 }
  }
}

let prefs: LessonAudioPrefs = readStoredPrefs()
const elements = new Set<HTMLAudioElement>()
const listeners = new Set<PrefsListener>()

export function getLessonAudioPrefs(): LessonAudioPrefs {
  return prefs
}

export function applyLessonAudioPrefs(audio: HTMLAudioElement, next = prefs) {
  audio.volume = next.enabled ? next.volume : 0
  audio.muted = !next.enabled
}

export function setLessonAudioPrefs(next: LessonAudioPrefs) {
  prefs = {
    enabled: next.enabled,
    volume: clampVolume(next.volume),
  }

  for (const audio of elements) {
    applyLessonAudioPrefs(audio, prefs)
    if (!prefs.enabled) {
      audio.pause()
    }
  }

  for (const listener of listeners) {
    listener(prefs)
  }
}

export function subscribeLessonAudioPrefs(listener: PrefsListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function registerLessonAudio(audio: HTMLAudioElement) {
  applyLessonAudioPrefs(audio)
  elements.add(audio)
  return () => {
    elements.delete(audio)
  }
}

export function canPlayLessonAudio(next = prefs) {
  return next.enabled && next.volume > 0
}
