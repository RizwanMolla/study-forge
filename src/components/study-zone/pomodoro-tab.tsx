'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  CloudRain,
  Waves,
  Wind,
  Brain,
  Coffee,
  Sparkles,
  Zap,
} from 'lucide-react';
import { incrementPomodoro } from '@/lib/actions/analytics.actions';
import { ambientSynth, AmbientSoundType } from '@/lib/audio/ambient-synth';
import { useToast } from '@/hooks/use-toast';

interface Preset {
  name: string;
  study: number; // in seconds
  break: number; // in seconds
  label: string;
}

const PRESETS: Preset[] = [
  { name: 'standard', study: 25 * 60, break: 5 * 60, label: '25 / 5 Standard' },
  { name: 'deep', study: 50 * 60, break: 10 * 60, label: '50 / 10 Deep Work' },
  { name: 'sprint', study: 15 * 60, break: 3 * 60, label: '15 / 3 Sprint' },
];

const SOUND_OPTIONS: { id: AmbientSoundType; label: string; icon: any; desc: string }[] = [
  { id: 'none', label: 'Silent', icon: VolumeX, desc: 'No background audio' },
  { id: 'rain', label: 'Rain', icon: CloudRain, desc: 'Pink noise & gentle shower' },
  { id: 'waves', label: 'Ocean Waves', icon: Waves, desc: 'Brownian wave swells' },
  { id: 'whitenoise', label: 'White Noise', icon: Wind, desc: 'Broadband focus masking' },
  { id: 'binaural', label: '40Hz Beats', icon: Brain, desc: 'Gamma wave focus stimulation' },
];

export function PomodoroTab() {
  const [selectedPreset, setSelectedPreset] = useState<Preset>(PRESETS[0]);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [time, setTime] = useState(PRESETS[0].study);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Audio State
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Zen Mode (Fullscreen)
  const [isZenMode, setIsZenMode] = useState(false);
  const zenContainerRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const totalTimeForCurrentMode =
    mode === 'study' ? selectedPreset.study : selectedPreset.break;
  const progressPercent = Math.round(
    ((totalTimeForCurrentMode - time) / totalTimeForCurrentMode) * 100
  );

  // Handle countdown timer & title
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
      document.title = `(${formatTime(time)}) ${mode === 'study' ? 'Focus' : 'Break'} | StudyForge`;
    } else if (isActive && time === 0) {
      if (mode === 'study') {
        setMode('break');
        setTime(selectedPreset.break);
        setCompletedSessions((s) => s + 1);

        // Procedural chime
        if (ambientSynth) ambientSynth.playChime(true);
        // Pause ambient audio on break
        if (ambientSynth) ambientSynth.stopAmbient();

        startTransition(async () => {
          try {
            await incrementPomodoro();
            toast({
              title: 'Focus Session Complete!',
              description: 'Time for a well-deserved short break.',
            });
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Could not record session.',
              variant: 'destructive',
            });
          }
        });
      } else {
        setMode('study');
        setTime(selectedPreset.study);

        // Procedural break chime
        if (ambientSynth) ambientSynth.playChime(false);
        // Resume ambient audio if selected
        if (ambientSynth && ambientSound !== 'none') {
          ambientSynth.playAmbient(ambientSound);
        }

        toast({
          title: 'Break Finished!',
          description: 'Ready to dive back into deep focus?',
        });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode, selectedPreset, ambientSound, toast]);

  // Clean up title and audio on unmount
  useEffect(() => {
    return () => {
      document.title = 'StudyForge: AI-Powered Personal Study Assistant';
      if (ambientSynth) ambientSynth.stopAmbient();
    };
  }, []);

  // Update audio when user toggles play/pause or changes sound
  useEffect(() => {
    if (!ambientSynth) return;

    if (isActive && mode === 'study' && ambientSound !== 'none' && !isMuted) {
      ambientSynth.setVolume(volume);
      ambientSynth.playAmbient(ambientSound);
    } else {
      ambientSynth.stopAmbient();
    }
  }, [isActive, mode, ambientSound, volume, isMuted]);

  const handleVolumeChange = (newVal: number[]) => {
    const val = newVal[0];
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    if (ambientSynth) {
      ambientSynth.setVolume(val);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (ambientSynth) ambientSynth.setVolume(volume || 0.5);
    } else {
      setIsMuted(true);
      if (ambientSynth) ambientSynth.setVolume(0);
    }
  };

  const handleSoundSelect = (sound: AmbientSoundType) => {
    setAmbientSound(sound);
    if (sound !== 'none' && !isActive) {
      toast({
        title: 'Sound Selected',
        description: 'Ambient sound will automatically play when you start the timer.',
      });
    }
  };

  const selectPreset = (p: Preset) => {
    setSelectedPreset(p);
    setIsActive(false);
    setMode('study');
    setTime(p.study);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMode('study');
    setTime(selectedPreset.study);
    document.title = 'Pomodoro Timer | StudyForge';
    if (ambientSynth) ambientSynth.stopAmbient();
  }, [selectedPreset]);

  const toggleZenMode = () => {
    setIsZenMode((prev) => !prev);
  };

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.key.toLowerCase() === 'r') {
        resetTimer();
      } else if (e.key.toLowerCase() === 'f') {
        toggleZenMode();
      } else if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTimer, resetTimer, isZenMode]);

  return (
    <div ref={zenContainerRef} className="space-y-6">
      {/* Fullscreen Zen Mode Overlay */}
      {isZenMode && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-12 animate-in fade-in-50 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Zen Focus Mode
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">Esc</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">F</kbd> to exit
              </span>
            </div>

            <Button variant="ghost" size="sm" onClick={toggleZenMode} className="gap-2">
              <Minimize2 className="h-4 w-4" />
              Exit Zen
            </Button>
          </div>

          {/* Large Zen Timer */}
          <div className="my-auto flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative flex items-center justify-center">
              {/* Pulsating Focus Glow */}
              <div
                className={`absolute h-72 w-72 md:h-96 md:w-96 rounded-full blur-3xl transition-opacity duration-1000 ${
                  isActive
                    ? mode === 'study'
                      ? 'bg-primary/20 opacity-100 animate-pulse'
                      : 'bg-emerald-500/20 opacity-100 animate-pulse'
                    : 'opacity-0'
                }`}
              />

              <div className="relative z-10 space-y-2">
                <span
                  className={`text-7xl sm:text-9xl md:text-[12rem] font-black font-mono tracking-tight select-none ${
                    mode === 'study' ? 'text-primary' : 'text-emerald-500'
                  }`}
                >
                  {formatTime(time)}
                </span>
                <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-muted-foreground">
                  {mode === 'study' ? 'Deep Focus Session' : 'Relaxing Short Break'}
                </p>
              </div>
            </div>

            {/* Controls in Zen Mode */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                onClick={toggleTimer}
                size="lg"
                className="px-8 py-6 text-lg font-bold shadow-xl gap-2"
              >
                {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                {isActive ? 'Pause' : 'Start Focus'}
              </Button>
              <Button onClick={resetTimer} variant="outline" size="lg" className="h-14 w-14">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Floating Sound Controller in Zen Mode */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Soundscape:</span>
              <div className="flex items-center gap-1">
                {SOUND_OPTIONS.map((opt) => (
                  <Button
                    key={opt.id}
                    variant={ambientSound === opt.id ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => handleSoundSelect(opt.id)}
                  >
                    <opt.icon className="h-3 w-3 mr-1" />
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-48">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMute}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Standard Card Dashboard Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Timer Display */}
        <Card className="lg:col-span-2 border-primary/20 bg-card/60 backdrop-blur shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <span>Focus Session</span>
                <Badge
                  variant="outline"
                  className={
                    mode === 'study'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }
                >
                  {mode === 'study' ? 'Work' : 'Break'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Structured focus intervals with Web Audio procedural soundscapes.
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleZenMode}
              className="gap-1.5 text-xs"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Zen Mode (F)
            </Button>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">
            {/* Presets Selector */}
            <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl border">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant={selectedPreset.name === preset.name ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => selectPreset(preset)}
                  className="text-xs h-8 rounded-lg"
                  disabled={isActive}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Timer Digits */}
            <div className="relative text-center py-4">
              <div
                className={`text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-tight select-none transition-colors duration-300 ${
                  mode === 'study' ? 'text-primary' : 'text-emerald-500'
                }`}
              >
                {formatTime(time)}
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-2">
                {mode === 'study' ? 'Stay in the zone' : 'Rest your eyes & stretch'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button
                onClick={toggleTimer}
                size="lg"
                className="w-36 py-6 text-base font-bold shadow-md gap-2"
              >
                {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {isActive ? 'Pause' : 'Start Focus'}
              </Button>

              <Button
                onClick={resetTimer}
                variant="outline"
                size="lg"
                className="h-12 w-12"
                title="Reset timer (R)"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Reset</span>
              </Button>
            </div>

            {/* Session Counter */}
            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Completed today: <strong className="text-foreground">{completedSessions}</strong>
              </span>
              <span>•</span>
              <span>Space to toggle • R to reset</span>
            </div>
          </CardContent>
        </Card>

        {/* Procedural Soundscape Control Panel */}
        <Card className="flex flex-col justify-between border-primary/20 bg-card/60 backdrop-blur shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Waves className="h-4 w-4 text-primary" />
                Procedural Soundscapes
              </CardTitle>
              <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                Web Audio DSP
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Synthesized mathematically in real-time. Zero network bandwidth.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 flex-1">
            {/* Sound Selector Buttons */}
            <div className="grid grid-cols-1 gap-2">
              {SOUND_OPTIONS.map((opt) => {
                const isSelected = ambientSound === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSoundSelect(opt.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border/60 hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Volume Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  Master Volume
                </span>
                <span>{isMuted ? '0%' : `${Math.round(volume * 100)}%`}</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>

          <div className="p-4 border-t bg-muted/20 rounded-b-xl text-[11px] text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              Auto-activates on start
            </span>
            <span>Chimes on session end</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
