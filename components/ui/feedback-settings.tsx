"use client"

import React from 'react';
import { useFeedback } from '../../lib/feedback-context';
import { SoundEffects } from '../../lib/sound-effects';
import { Slider } from './slider';
import { Switch } from './switch';

export function FeedbackSettings() {
  const {
    isSoundEnabled,
    soundVolume,
    isAnimationEnabled,
    toggleSound,
    toggleAnimation,
    setVolume,
    playFeedback
  } = useFeedback();

  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    if (isSoundEnabled && value > 0) {
      await playFeedback('click', { animation: false });
    }
  };

  const handleSoundToggle = async () => {
    toggleSound();
    if (!isSoundEnabled) { // Only play if we're enabling sound
      await playFeedback('click', { animation: false });
    }
  };

  const handleAnimationToggle = async () => {
    toggleAnimation();
    await playFeedback('click', { animation: false });
  };

  // Get sound loading status
  const soundStatus = SoundEffects.getStatus();
  const hasErrors = Object.values(soundStatus).some(status => status.error);
  const isLoading = Object.values(soundStatus).some(status => !status.loaded && !status.error);

  return (
    <div className="p-4 space-y-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Feedback Settings</h3>
        <p className="text-sm text-gray-500">Customize your learning experience</p>
      </div>

      {/* Sound Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Sound Effects</h4>
            <p className="text-sm text-gray-500">
              {hasErrors ? 'Some sounds failed to load' : 
               isLoading ? 'Loading sounds...' : 
               'Enable or disable sound effects'}
            </p>
          </div>
          <Switch
            checked={isSoundEnabled}
            onCheckedChange={handleSoundToggle}
            disabled={isLoading}
            className={hasErrors ? 'opacity-50' : ''}
          />
        </div>

        {isSoundEnabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Volume</label>
              <span className="text-sm text-gray-500">{Math.round(soundVolume * 100)}%</span>
            </div>
            <Slider
              value={[soundVolume * 100]}
              onValueChange={([value]) => handleVolumeChange(value / 100)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Animation Settings */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          <h4 className="font-medium text-gray-900">Animations</h4>
          <p className="text-sm text-gray-500">Enable or disable visual feedback</p>
        </div>
        <Switch
          checked={isAnimationEnabled}
          onCheckedChange={handleAnimationToggle}
        />
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t">
        <button
          onClick={() => playFeedback('correct')}
          className="px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Test Correct
        </button>
        <button
          onClick={() => playFeedback('incorrect')}
          className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Test Incorrect
        </button>
      </div>
    </div>
  );
} 