import { Howl } from 'howler';

export type SoundEffect = 'correct' | 'incorrect' | 'complete' | 'click' | 'levelUp' | 'streak' | 'flashcardFlip' | 'uiClick' | 'dngClick' | 'dngSuccess' | 'quizSuccess' | 'finishedLesson' | 'timerTick';

// Synthesized tick sound via Web Audio API (no file needed)
function playTickSound(volume: number = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.08)
    oscillator.onended = () => ctx.close()
  } catch (_) { }
}

// ── Flashcard Synthesized Sounds ──────────────────────────────────────────────

// Flip to back: deep, mellow "whoosh" down from 600→300 Hz
export function playFlashcardFlipForward(volume = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.18)
    gain.gain.setValueAtTime(volume * 0.35, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.22)
    osc.onended = () => ctx.close()
  } catch (_) { }
}

// Flip to front: lighter, crisper "snap" up from 300→600 Hz
export function playFlashcardFlipBack(volume = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(280, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.14)
    gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.18)
    osc.onended = () => ctx.close()
  } catch (_) { }
}

// Next card: brief rising ding (440→660 Hz)
export function playFlashcardNext(volume = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(volume * 0.28, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.13)
    osc.onended = () => ctx.close()
  } catch (_) { }
}

// Previous card: brief falling ding (660→440 Hz)
export function playFlashcardPrev(volume = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(660, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(volume * 0.28, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.13)
    osc.onended = () => ctx.close()
  } catch (_) { }
}

// Deck complete: warm two-note ascending chord (C5 → E5 together)
export function playFlashcardComplete(volume = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ;[523.25, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06)
        gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime + i * 0.06)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5 + i * 0.06)
        osc.start(ctx.currentTime + i * 0.06)
        osc.stop(ctx.currentTime + 0.5 + i * 0.06)
        osc.onended = () => ctx.close()
      })
  } catch (_) { }
}

interface SoundStatus {
  loaded: boolean;
  error: boolean;
}

class SoundEffectManager {
  private sounds: Record<SoundEffect, Howl>;
  private status: Record<SoundEffect, SoundStatus>;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private soundVolumes: Record<SoundEffect, number> = {
    correct: 1,
    incorrect: 1,
    complete: 1,
    click: 1,
    levelUp: 1.0, // Level up should be more pronounced
    streak: 1,
    flashcardFlip: 1,
    uiClick: 1.0, // UI clicks should be more pronounced
    dngClick: 1.0,
    dngSuccess: 1,
    quizSuccess: 1,
    finishedLesson: 1,
    timerTick: 0.5
  };

  constructor() {
    // Configure Howler to use Web Audio API for short UI/game sound effects
    // Setting html5: false avoids creating HTML5 Audio tags and prevents pool exhaustion
    this.sounds = {
      correct: new Howl({
        src: ['/sounds/correct.mp3'],
        html5: false,
        preload: true
      }),
      incorrect: new Howl({
        src: ['/sounds/incorrect.wav'],
        html5: false,
        preload: true
      }),
      complete: new Howl({
        src: ['/sounds/complete.mp3'],
        html5: false,
        preload: true
      }),
      click: new Howl({
        src: ['/sounds/click.wav'],
        html5: false,
        preload: true
      }),
      levelUp: new Howl({
        src: ['/sounds/level-up.mp3'],
        html5: false,
        preload: true
      }),
      streak: new Howl({
        src: ['/sounds/streak.mp3'],
        html5: false,
        preload: true
      }),
      flashcardFlip: new Howl({
        src: ['/sounds/flashcard-flip.mp3'],
        html5: false,
        preload: true
      }),
      uiClick: new Howl({
        src: ['/sounds/ui-click.mp3'],
        html5: false,
        preload: true
      }),
      dngClick: new Howl({
        src: ['/sounds/dng-click.mp3'],
        html5: false,
        preload: true
      }),
      dngSuccess: new Howl({
        src: ['/sounds/dng-success.mp3'],
        html5: false,
        preload: true
      }),
      quizSuccess: new Howl({
        src: ['/sounds/quiz-success.mp3'],
        html5: false,
        preload: true
      }),
      finishedLesson: new Howl({
        src: ['/sounds/finished-lesson.mp3'],
        html5: false,
        preload: true
      }),
      timerTick: new Howl({
        src: ['/sounds/ui-click.mp3'], // Dummy Howl for type completeness; synthesized Web Audio is used in play()
        html5: false,
        preload: true
      }),
    };

    this.status = Object.keys(this.sounds).reduce((acc, key) => ({
      ...acc,
      [key]: { loaded: false, error: false }
    }), {} as Record<SoundEffect, SoundStatus>);

    // Set up load and error handlers for each sound
    Object.entries(this.sounds).forEach(([key, sound]) => {
      sound.on('load', () => {
        this.status[key as SoundEffect].loaded = true;
      });

      sound.on('loaderror', () => {
        this.status[key as SoundEffect].error = true;
      });
    });
  }

  async play(effect: SoundEffect): Promise<void> {
    if (this.isMuted) return;

    // timerTick is synthesized — no Howl entry needed
    if (effect === 'timerTick') {
      playTickSound(this.volume)
      return
    }

    const sound = this.sounds[effect];
    if (!sound) return;

    try {
      // Resume Howler AudioContext if browser suspended it
      if (typeof window !== 'undefined' && (window as any).Howler?.ctx?.state === 'suspended') {
        await (window as any).Howler.ctx.resume()
      }

      if (sound.state() === 'unloaded') {
        sound.load()
      }

      const effectVolume = this.soundVolumes[effect] || 0.5;
      const finalVolume = this.volume * effectVolume;
      sound.volume(finalVolume);
      sound.play();
    } catch (error) {
      console.error(`Error playing sound effect ${effect}:`, error);
    }
  }

  mute(): void {
    this.isMuted = true;
    Object.values(this.sounds).forEach(sound => sound.mute(true));
  }

  unmute(): void {
    this.isMuted = false;
    Object.values(this.sounds).forEach(sound => sound.mute(false));
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    // Update all sound volumes based on their individual settings
    Object.entries(this.sounds).forEach(([effect, sound]) => {
      const effectVolume = this.soundVolumes[effect as SoundEffect] || 0.5;
      sound.volume(this.volume * effectVolume);
    });
  }

  setSoundVolume(effect: SoundEffect, volume: number): void {
    // Ensure volume is between 0 and 1
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    this.soundVolumes[effect] = normalizedVolume;

    // Update the sound's current volume
    const sound = this.sounds[effect];
    if (sound) {
      sound.volume(this.volume * normalizedVolume);
    }
  }

  getSoundVolume(effect: SoundEffect): number {
    return this.soundVolumes[effect] || 0.5;
  }

  getStatus(): Record<SoundEffect, SoundStatus> {
    return { ...this.status };
  }

  async preloadAll(): Promise<void> {
    // Check if service worker is available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        // Check cache first
        const cache = await caches.open('ast-builder-sounds-v1');

        // Load sounds that are cached
        await Promise.all(
          Object.entries(this.sounds).map(async ([key, sound]) => {
            const soundUrl = (sound as any)._src || (sound as any)._sounds?.[0]?._src; // Get the sound URL
            if (soundUrl) {
              const cached = await cache.match(soundUrl);
              if (cached) {
                console.log(`Loading cached sound: ${key}`);
                sound.load();
              } else {
                console.log(`Sound not cached, loading from network: ${key}`);
                sound.load();
              }
            } else {
              sound.load();
            }
          })
        );
      } catch (error) {
        console.warn('Error checking sound cache:', error);
        // Fallback to normal loading if cache check fails
        Object.values(this.sounds).forEach(sound => sound.load());
      }
    } else {
      // No service worker, load normally
      Object.values(this.sounds).forEach(sound => sound.load());
    }
  }

  unloadAll(): void {
    Object.values(this.sounds).forEach(sound => sound.unload());
  }
}

export const SoundEffects = new SoundEffectManager();



