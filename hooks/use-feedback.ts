import { useCallback, useEffect } from 'react';
import { SoundEffects, SoundEffect } from '../lib/sound-effects';

type FeedbackType = 'correct' | 'incorrect' | 'complete' | 'click' | 'levelUp' | 'streak';

interface FeedbackOptions {
  animation?: boolean;
  sound?: boolean;
}

export function useFeedback() {
  // Preload sounds when the hook is first used
  useEffect(() => {
    SoundEffects.preloadAll();
    return () => {
      SoundEffects.unloadAll();
    };
  }, []);

  const playFeedback = useCallback(async (type: FeedbackType, options: FeedbackOptions = {}) => {
    const { animation = true, sound = true } = options;

    // Play sound effect
    if (sound) {
      await SoundEffects.play(type as SoundEffect);
    }

    // Return animation class based on feedback type
    if (animation) {
      switch (type) {
        case 'correct':
          return 'duo-bounce';
        case 'incorrect':
          return 'duo-shake';
        case 'complete':
          return 'duo-celebrate';
        case 'click':
          return 'duo-pop';
        case 'levelUp':
          return 'duo-celebrate duo-pulse';
        case 'streak':
          return 'duo-bounce duo-pulse';
        default:
          return '';
      }
    }

    return '';
  }, []);

  return {
    playFeedback,
  };
} 