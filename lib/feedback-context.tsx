"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SoundEffects, SoundEffect } from './sound-effects';

interface FeedbackContextType {
  isSoundEnabled: boolean;
  soundVolume: number;
  isAnimationEnabled: boolean;
  toggleSound: () => void;
  toggleAnimation: () => void;
  setVolume: (volume: number) => void;
  playFeedback: (type: SoundEffect, options?: FeedbackOptions) => Promise<string>;
}

interface FeedbackOptions {
  animation?: boolean;
  sound?: boolean;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);

  // Initialize sound system
  useEffect(() => {
    SoundEffects.preloadAll();
    return () => {
      SoundEffects.unloadAll();
    };
  }, []);

  // Update sound settings when they change
  useEffect(() => {
    if (isSoundEnabled) {
      SoundEffects.unmute();
      SoundEffects.setVolume(soundVolume);
    } else {
      SoundEffects.mute();
    }
  }, [isSoundEnabled, soundVolume]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);

  const toggleAnimation = useCallback(() => {
    setIsAnimationEnabled(prev => !prev);
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSoundVolume(Math.max(0, Math.min(1, volume)));
  }, []);

  const playFeedback = useCallback(async (type: SoundEffect, options: FeedbackOptions = {}) => {
    const { animation = true, sound = true } = options;

    // Only play click sounds if explicitly requested with sound=true
    // This prevents accidental triggering of click sounds from global click events
    if (type === 'click' && !options.hasOwnProperty('sound')) {
      return '';
    }

    // Play sound if enabled and requested
    if (sound && isSoundEnabled) {
      await SoundEffects.play(type);
    }

    // Return animation class if enabled and requested
    if (animation && isAnimationEnabled) {
      switch (type) {
        case 'correct':
          return 'duo-bounce duo-pulse';
        case 'incorrect':
          return 'duo-shake';
        case 'complete':
          return 'duo-celebrate duo-pulse';
        case 'click':
          return 'duo-pop';
        case 'levelUp':
          return 'duo-celebrate duo-pulse duo-float';
        case 'streak':
          return 'duo-bounce duo-pulse duo-float';
        default:
          return '';
      }
    }

    return '';
  }, [isSoundEnabled, isAnimationEnabled]);

  return (
    <FeedbackContext.Provider value={{
      isSoundEnabled,
      soundVolume,
      isAnimationEnabled,
      toggleSound,
      toggleAnimation,
      setVolume,
      playFeedback,
    }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
} 