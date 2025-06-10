import { Howl } from 'howler';

export type SoundEffect = 'correct' | 'incorrect' | 'complete' | 'click' | 'levelUp' | 'streak';

interface SoundStatus {
  loaded: boolean;
  error: boolean;
}

class SoundEffectManager {
  private sounds: Record<SoundEffect, Howl>;
  private status: Record<SoundEffect, SoundStatus>;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  constructor() {
    this.sounds = {
      correct: new Howl({ src: ['/sounds/correct.mp3'] }),
      incorrect: new Howl({ src: ['/sounds/incorrect.wav'] }),
      complete: new Howl({ src: ['/sounds/complete.mp3'] }),
      click: new Howl({ src: ['/sounds/click.wav'] }),
      levelUp: new Howl({ src: ['/sounds/level-up.mp3'] }),
      streak: new Howl({ src: ['/sounds/streak.mp3'] })
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
      sound.volume(this.volume);
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
    Object.values(this.sounds).forEach(sound => sound.volume(this.volume));
  }

  getStatus(): Record<SoundEffect, SoundStatus> {
    return { ...this.status };
  }

  preloadAll(): void {
    Object.values(this.sounds).forEach(sound => sound.load());
  }

  unloadAll(): void {
    Object.values(this.sounds).forEach(sound => sound.unload());
  }
}

export const SoundEffects = new SoundEffectManager();



