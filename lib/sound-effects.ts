import { Howl } from 'howler';

export type SoundEffect = 'correct' | 'incorrect' | 'complete' | 'click' | 'levelUp' | 'streak' | 'flashcardFlip' | 'uiClick' | 'dngClick' | 'dngSuccess' | 'quizSuccess' | 'finishedLesson';

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
    finishedLesson: 1
  };

  constructor() {
    // Configure Howler to use the cached audio files
    this.sounds = {
      correct: new Howl({ 
        src: ['/sounds/correct.mp3'],
        html5: true, // Enable HTML5 Audio to work better with service worker cache
        preload: false // We'll handle preloading manually
      }),
      incorrect: new Howl({ 
        src: ['/sounds/incorrect.wav'],
        html5: true,
        preload: false
      }),
      complete: new Howl({ 
        src: ['/sounds/complete.mp3'],
        html5: true,
        preload: false
      }),
      click: new Howl({ 
        src: ['/sounds/click.wav'],
        html5: true,
        preload: false
      }),
      levelUp: new Howl({ 
        src: ['/sounds/level-up.mp3'],
        html5: true,
        preload: false
      }),
      streak: new Howl({ 
        src: ['/sounds/streak.mp3'],
        html5: true,
        preload: false
      }),
      flashcardFlip: new Howl({ 
        src: ['/sounds/flashcard-flip.mp3'],
        html5: true,
        preload: false
      }),
      uiClick: new Howl({ 
        src: ['/sounds/ui-click.mp3'],
        html5: true,
        preload: false
      }),
      dngClick: new Howl({ 
        src: ['/sounds/dng-click.mp3'],
        html5: true,
        preload: false
      }),
      dngSuccess: new Howl({ 
        src: ['/sounds/dng-success.mp3'],
        html5: true,
        preload: false
      }),
      quizSuccess: new Howl({ 
        src: ['/sounds/quiz-success.mp3'],
        html5: true,
        preload: false
      }),
      finishedLesson: new Howl({ 
        src: ['/sounds/finished-lesson.mp3'],
        html5: true,
        preload: false
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
    if (this.isMuted || this.status[effect].error) return;
    
    const sound = this.sounds[effect];
    if (!sound) return;

    try {
      // Calculate final volume by multiplying base volume with effect-specific volume
      const effectVolume = this.soundVolumes[effect] || 0.5;
      const finalVolume = this.volume * effectVolume;
      sound.volume(finalVolume);
      await sound.play();
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
            const soundUrl = (sound as any)._src || sound._sounds?.[0]?._src; // Get the sound URL
            const cached = await cache.match(soundUrl);
            if (cached) {
              console.log(`Loading cached sound: ${key}`);
              sound.load();
            } else {
              console.log(`Sound not cached, loading from network: ${key}`);
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



