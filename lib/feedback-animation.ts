import type { SoundEffect } from './sound-effects'

export function animationClassFor(type: SoundEffect): string {
  switch (type) {
    case 'correct':
    case 'quizSuccess':
    case 'dngSuccess':
      return 'duo-bounce'
    case 'incorrect':
    case 'softMiss':
    case 'blockedClick':
      return 'duo-shake'
    case 'complete':
    case 'finishedLesson':
    case 'levelUp':
    case 'streak':
      return 'duo-celebrate'
    case 'click':
    case 'uiClick':
    case 'dngClick':
    case 'flashcardFlip':
    case 'categorizeSlot':
    case 'categorizeBucketComplete':
      return 'duo-pop'
    default:
      return ''
  }
}
