"use client"

import type { ReactNode } from 'react'
import { Volume2, VolumeX, Sparkles } from 'lucide-react'
import { useFeedback } from '@/hooks/use-feedback'
import { SoundEffects } from '@/lib/sound-effects'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Slider } from './slider'
import { Switch } from './switch'
import { cn } from '@/lib/utils'

function PreferenceRow({
  icon,
  iconClassName,
  title,
  description,
  children,
}: {
  icon: ReactNode
  iconClassName: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 bg-white">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", iconClassName)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{title}</h4>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}

export function FeedbackSettings({ compact = false, showIntro = true }: { compact?: boolean; showIntro?: boolean }) {
  const {
    isSoundEnabled,
    soundVolume,
    isAnimationEnabled,
    toggleSound,
    toggleAnimation,
    setVolume,
    playFeedback
  } = useFeedback()

  const handleVolumeChange = async (value: number) => {
    setVolume(value)
    if (isSoundEnabled && value > 0) {
      await playFeedback('click', { animation: false })
    }
  }

  const handleAnimationToggle = async () => {
    toggleAnimation()
    await playFeedback('click', { animation: false })
  }

  const soundStatus = SoundEffects.getStatus()
  const hasErrors = Object.values(soundStatus).some(status => status.error)
  const isLoading = Object.values(soundStatus).some(status => !status.loaded && !status.error)

  const soundDescription = hasErrors
    ? 'Some sounds failed to load'
    : isLoading
      ? 'Loading sounds…'
      : 'Narration, Listen buttons, and answer sounds'

  return (
    <div className={cn("space-y-3", compact && "space-y-2.5")}>
      {!compact && showIntro && (
        <div className="space-y-1 pb-1">
          <h3 className="text-base font-extrabold text-slate-800">How lessons feel</h3>
          <p className="text-xs text-slate-500 font-medium">
            These save on this device and apply the next time you open a lesson.
          </p>
        </div>
      )}

      <PreferenceRow
        icon={<Volume2 className="w-5 h-5" />}
        iconClassName="bg-[#1CB0F6]/10 text-[#1CB0F6]"
        title="Lesson audio"
        description={soundDescription}
      >
        <Switch
          checked={isSoundEnabled}
          onCheckedChange={toggleSound}
          disabled={isLoading}
          aria-label="Lesson audio"
          className={cn("data-[state=checked]:bg-[#58CC02]", hasErrors && "opacity-50")}
        />
      </PreferenceRow>

      {isSoundEnabled && (
        <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 bg-white">
          <div className="w-11 h-11 rounded-xl bg-[#58CC02]/10 text-[#58CC02] flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-extrabold text-slate-800 leading-tight">Volume</h4>
              <span className="text-xs font-extrabold text-slate-500 tabular-nums">{Math.round(soundVolume * 100)}%</span>
            </div>
            <Slider
              value={[soundVolume * 100]}
              onValueChange={([value]) => handleVolumeChange(value / 100)}
              max={100}
              step={1}
              aria-label="Lesson volume"
              className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&>span:first-child]:h-2.5 [&>span:first-child>span]:bg-[#58CC02]"
            />
          </div>
        </div>
      )}

      <PreferenceRow
        icon={<Sparkles className="w-5 h-5" />}
        iconClassName="bg-amber-100 text-amber-600"
        title="Answer animations"
        description="Bounce on correct answers, shake on misses"
      >
        <Switch
          checked={isAnimationEnabled}
          onCheckedChange={handleAnimationToggle}
          aria-label="Answer animations"
          className="data-[state=checked]:bg-[#58CC02]"
        />
      </PreferenceRow>
    </div>
  )
}

export function FeedbackSettingsButton({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { isSoundEnabled } = useFeedback()
  const Icon = isSoundEnabled ? Volume2 : VolumeX

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Sound and animation settings"
          aria-label="Sound and animation settings"
          className={cn(
            "min-h-11 min-w-11 rounded-xl border-2",
            tone === "light"
              ? "text-[#CE82FF] hover:text-white hover:bg-[#CE82FF] border-[#CE82FF]/30 bg-[#CE82FF]/10"
              : "text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700"
          )}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(20rem,calc(100vw-1.5rem))] p-3 rounded-2xl border-2 border-slate-200 shadow-lg">
        <FeedbackSettings compact />
      </PopoverContent>
    </Popover>
  )
}
