import { Howl } from 'howler';

export type SoundEffect = 'correct' | 'incorrect' | 'complete' | 'click' | 'levelUp' | 'streak' | 'flashcardFlip' | 'uiClick' | 'dngClick' | 'dngSuccess' | 'quizSuccess' | 'finishedLesson' | 'timerTick' | 'categorizeSlot' | 'categorizeBucketComplete' | 'softMiss' | 'blockedClick' | 'powerupUsed' | 'starsSpent';

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

/** Quiet low tap for non-penalty misses (e.g. hotspot decoy / empty click) */
function playSoftMissSound(volume: number = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(240, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.07)
    gain.gain.setValueAtTime(volume * 0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.09)
    osc.onended = () => ctx.close()
  } catch (_) { }
}

/** Charge + rising triad + sparkle when a powerup is armed or used. */
export function playPowerupUsedSound(volume: number = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const start = ctx.currentTime
    const master = ctx.createGain()
    master.connect(ctx.destination)
    master.gain.setValueAtTime(volume * 0.55, start)

    const thump = ctx.createOscillator()
    const thumpGain = ctx.createGain()
    thump.connect(thumpGain)
    thumpGain.connect(master)
    thump.type = 'sine'
    thump.frequency.setValueAtTime(140, start)
    thump.frequency.exponentialRampToValueAtTime(90, start + 0.16)
    thumpGain.gain.setValueAtTime(0.9, start)
    thumpGain.gain.exponentialRampToValueAtTime(0.001, start + 0.18)
    thump.start(start)
    thump.stop(start + 0.18)

    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(master)
      osc.type = index === 2 ? 'triangle' : 'sine'
      const t = start + 0.08 + index * 0.07
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(0.45, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
      osc.start(t)
      osc.stop(t + 0.24)
    })

    const sparkle = ctx.createOscillator()
    const sparkleGain = ctx.createGain()
    sparkle.connect(sparkleGain)
    sparkleGain.connect(master)
    sparkle.type = 'sine'
    sparkle.frequency.setValueAtTime(1318.5, start + 0.28)
    sparkle.frequency.exponentialRampToValueAtTime(1975.5, start + 0.42)
    sparkleGain.gain.setValueAtTime(0.001, start + 0.28)
    sparkleGain.gain.linearRampToValueAtTime(0.22, start + 0.3)
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, start + 0.48)
    sparkle.start(start + 0.28)
    sparkle.stop(start + 0.5)

    setTimeout(() => ctx.close(), 600)
  } catch (_) { }
}

/** Falling coin chime when stars leave the wallet. */
export function playStarsSpentSound(volume: number = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const start = ctx.currentTime
    const master = ctx.createGain()
    master.connect(ctx.destination)
    master.gain.setValueAtTime(volume * 0.5, start)

    const notes = [784, 659.25, 523.25, 392]
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(master)
      osc.type = index === 0 ? 'triangle' : 'sine'
      const t = start + index * 0.055
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(0.42, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      osc.start(t)
      osc.stop(t + 0.2)
    })

    const clink = ctx.createOscillator()
    const clinkGain = ctx.createGain()
    clink.connect(clinkGain)
    clinkGain.connect(master)
    clink.type = 'square'
    clink.frequency.setValueAtTime(1244, start)
    clinkGain.gain.setValueAtTime(0.12, start)
    clinkGain.gain.exponentialRampToValueAtTime(0.001, start + 0.06)
    clink.start(start)
    clink.stop(start + 0.07)

    setTimeout(() => ctx.close(), 500)
  } catch (_) { }
}

/** Short buzz when input is blocked (e.g. no clicks remaining) */
function playBlockedClickSound(volume: number = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const start = ctx.currentTime
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      const t = start + i * 0.11
      osc.frequency.setValueAtTime(140, t)
      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(volume * 0.07, t + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07)
      osc.start(t)
      osc.stop(t + 0.075)
    }
    setTimeout(() => ctx.close(), 300)
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

// Slider step tick — soft mechanical notch
export function playSliderTick(volume = 0.35) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(520, ctx.currentTime)
    gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.06)
    osc.onended = () => ctx.close()
  } catch (_) { }
}

// Code run — quick double terminal blip
export function playCodeRun(volume = 0.4) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ;[640, 820].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'square'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05)
        gain.gain.setValueAtTime(volume * 0.12, ctx.currentTime + i * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05 + i * 0.05)
        osc.start(ctx.currentTime + i * 0.05)
        osc.stop(ctx.currentTime + 0.07 + i * 0.05)
        osc.onended = () => { if (i === 1) ctx.close() }
      })
  } catch (_) { }
}

// Content reveal — brief ascending sweep (image/table acknowledge)
export function playReveal(volume = 0.45) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.18)
    osc.onended = () => ctx.close()
  } catch (_) { }
}

// Spin wheel — launch whoosh, decelerating peg ticks, landing ding
export function playWheelSpin(durationMs = 6500, volume = 0.45) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = ctx.currentTime
    const dur = durationMs / 1000

    // Launch whoosh
    const whoosh = ctx.createOscillator()
    const whooshGain = ctx.createGain()
    whoosh.type = 'sawtooth'
    whoosh.frequency.setValueAtTime(220, now)
    whoosh.frequency.exponentialRampToValueAtTime(80, now + 0.18)
    whooshGain.gain.setValueAtTime(volume * 0.07, now)
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    whoosh.connect(whooshGain)
    whooshGain.connect(ctx.destination)
    whoosh.start(now)
    whoosh.stop(now + 0.22)

    // Peg ticks — spacing eases out to mimic wheel slowing down
    const tickCount = 32
    for (let i = 0; i < tickCount; i++) {
      const progress = i / Math.max(tickCount - 1, 1)
      const t = now + 0.1 + progress * progress * Math.max(dur - 0.4, 0.5)
      const tickOsc = ctx.createOscillator()
      const tickGain = ctx.createGain()
      tickOsc.type = 'triangle'
      tickOsc.frequency.setValueAtTime(780 + (1 - progress) * 520, t)
      tickGain.gain.setValueAtTime(volume * (0.08 + (1 - progress) * 0.12), t)
      tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035)
      tickOsc.connect(tickGain)
      tickGain.connect(ctx.destination)
      tickOsc.start(t)
      tickOsc.stop(t + 0.04)
    }

    // Landing chime when the wheel stops
    const landT = now + dur - 0.08
      ;[880, 1318.5].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, landT + i * 0.05)
        gain.gain.setValueAtTime(volume * 0.28, landT + i * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, landT + 0.45 + i * 0.05)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(landT + i * 0.05)
        osc.stop(landT + 0.5 + i * 0.05)
        if (i === 1) osc.onended = () => ctx.close()
      })
  } catch (_) { }
}

// ── Synthesized Fallback Sound Effects (Web Audio API) ──────────────────────────

function playSynthesizedCorrectSound(volume: number = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = ctx.currentTime
      ;[523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.08)
        gain.gain.setValueAtTime(volume * 0.25, now + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3 + i * 0.08)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.08)
        osc.stop(now + 0.35 + i * 0.08)
        if (i === 2) osc.onended = () => ctx.close()
      })
  } catch (_) { }
}

function playSynthesizedIncorrectSound(volume: number = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = ctx.currentTime
      ;[220, 164.81].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, now + i * 0.1)
        gain.gain.setValueAtTime(volume * 0.2, now + i * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25 + i * 0.1)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.1)
        osc.stop(now + 0.28 + i * 0.1)
        if (i === 1) osc.onended = () => ctx.close()
      })
  } catch (_) { }
}

function playSynthesizedChimeSound(volume: number = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = ctx.currentTime
      ;[659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.06)
        gain.gain.setValueAtTime(volume * 0.25, now + i * 0.06)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25 + i * 0.06)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.06)
        osc.stop(now + 0.3 + i * 0.06)
        if (i === 1) osc.onended = () => ctx.close()
      })
  } catch (_) { }
}

function playSynthesizedClickSound(volume: number = 0.5) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.045)
    osc.onended = () => ctx.close()
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
    timerTick: 0.5,
    categorizeSlot: 0.5,
    categorizeBucketComplete: 0.7,
    softMiss: 0.35,
    blockedClick: 0.4,
    powerupUsed: 0.9,
    starsSpent: 0.85,
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
      categorizeSlot: new Howl({
        src: ['/sounds/categorize-slot.mp3'],
        html5: false,
        preload: true
      }),
      categorizeBucketComplete: new Howl({
        src: ['/sounds/categorize-bucket-complete.mp3'],
        html5: false,
        preload: true
      }),
      softMiss: new Howl({
        src: ['/sounds/ui-click.mp3'], // Dummy Howl; synthesized Web Audio is used in play()
        html5: false,
        preload: false
      }),
      blockedClick: new Howl({
        src: ['/sounds/ui-click.mp3'], // Dummy Howl; synthesized Web Audio is used in play()
        html5: false,
        preload: false
      }),
      powerupUsed: new Howl({
        src: ['/sounds/ui-click.mp3'], // Dummy Howl; synthesized Web Audio is used in play()
        html5: false,
        preload: false
      }),
      starsSpent: new Howl({
        src: ['/sounds/ui-click.mp3'],
        html5: false,
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
        this.status[key as SoundEffect].error = false;
      });

      sound.on('loaderror', () => {
        this.status[key as SoundEffect].error = true;
        this.status[key as SoundEffect].loaded = false;
      });
    });
  }

  private playFallbackSynthesized(effect: SoundEffect, volume: number): void {
    if (effect === 'correct') {
      playSynthesizedCorrectSound(volume);
    } else if (effect === 'incorrect') {
      playSynthesizedIncorrectSound(volume);
    } else if (effect === 'complete' || effect === 'finishedLesson' || effect === 'levelUp' || effect === 'streak') {
      playSynthesizedCorrectSound(volume);
    } else if (effect === 'quizSuccess' || effect === 'dngSuccess' || effect === 'categorizeBucketComplete') {
      playSynthesizedChimeSound(volume);
    } else {
      playSynthesizedClickSound(volume);
    }
  }

  async play(effect: SoundEffect): Promise<void> {
    if (this.isMuted) return;

    // timerTick / softMiss are synthesized — no Howl playback needed
    if (effect === 'timerTick') {
      playTickSound(this.volume)
      return
    }
    if (effect === 'softMiss') {
      playSoftMissSound(this.volume)
      return
    }
    if (effect === 'blockedClick') {
      playBlockedClickSound(this.volume)
      return
    }
    if (effect === 'powerupUsed') {
      playPowerupUsedSound(this.volume)
      return
    }
    if (effect === 'starsSpent') {
      playStarsSpentSound(this.volume)
      return
    }

    const sound = this.sounds[effect];
    const effectVolume = (this.soundVolumes[effect] || 0.5) * this.volume;

    try {
      // Resume Howler AudioContext if browser suspended it
      if (typeof window !== 'undefined' && (window as any).Howler?.ctx?.state === 'suspended') {
        await (window as any).Howler.ctx.resume()
      }

      if (!sound || sound.state() !== 'loaded' || this.status[effect]?.error) {
        if (sound && sound.state() === 'unloaded') {
          sound.load();
        }
        // Always guarantee audio feedback via Web Audio synthesizer
        this.playFallbackSynthesized(effect, effectVolume);
        return;
      }

      sound.volume(effectVolume);
      sound.play();
    } catch (error) {
      console.warn(`[SoundEffectManager] Error playing sound effect ${effect}, using synthesized fallback:`, error);
      this.playFallbackSynthesized(effect, effectVolume);
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
        const cache = await caches.open('ast-builder-sounds-v2');

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



