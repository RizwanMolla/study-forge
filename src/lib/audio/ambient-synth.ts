/**
 * Procedural Ambient Audio Synthesizer using Web Audio API
 * 
 * Generates ambient soundscapes (Rain, Ocean Waves, White Noise, Binaural Beats)
 * and notification chimes entirely in-browser using mathematical DSP.
 * Zero external audio files, zero network bandwidth, zero external cost.
 */

export type AmbientSoundType = 'none' | 'rain' | 'waves' | 'whitenoise' | 'binaural';

class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSourceNodes: {
    sources: (AudioNode | AudioBufferSourceNode | OscillatorNode)[];
    gain: GainNode;
  } | null = null;
  private currentSound: AmbientSoundType = 'none';
  private volume: number = 0.5;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentSound(): AmbientSoundType {
    return this.currentSound;
  }

  public stopAmbient() {
    if (this.currentSourceNodes && this.ctx) {
      const { gain, sources } = this.currentSourceNodes;
      // Smooth fade out to prevent clicks
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      setTimeout(() => {
        sources.forEach((node) => {
          try {
            if ('stop' in node && typeof (node as any).stop === 'function') {
              (node as any).stop();
            }
            node.disconnect();
          } catch (e) {
            // Already stopped
          }
        });
        gain.disconnect();
      }, 150);
      this.currentSourceNodes = null;
    }
    this.currentSound = 'none';
  }

  public playAmbient(type: AmbientSoundType) {
    if (type === 'none') {
      this.stopAmbient();
      return;
    }

    if (this.currentSound === type && this.currentSourceNodes) {
      return;
    }

    this.stopAmbient();
    const ctx = this.getAudioContext();
    const soundGain = ctx.createGain();
    soundGain.gain.setValueAtTime(0, ctx.currentTime);
    soundGain.connect(this.masterGain!);

    const activeNodes: (AudioNode | AudioBufferSourceNode | OscillatorNode)[] = [];

    if (type === 'whitenoise') {
      // White noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Gentle bandpass to make it pleasant for human ears
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      noise.connect(filter);
      filter.connect(soundGain);
      noise.start();

      activeNodes.push(noise, filter);
    } else if (type === 'rain') {
      // Pink noise synthesis (1/f) simulates rain on glass/roof
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Lowpass filter for muffled rain
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(850, ctx.currentTime);

      // Subtle LFO modulation for rainfall density variation
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // 0.2 Hz slow breeze
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(150, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(rainFilter.frequency);
      lfo.start();

      noise.connect(rainFilter);
      rainFilter.connect(soundGain);
      noise.start();

      activeNodes.push(noise, rainFilter, lfo, lfoGain);
    } else if (type === 'waves') {
      // Brown noise (1/f^2) + slow LFO modulation for ocean waves surge
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = 'lowpass';
      waveFilter.frequency.setValueAtTime(350, ctx.currentTime);

      // Low frequency oscillator for wave swells (0.1 Hz = ~10 second wave cycle)
      const swellOsc = ctx.createOscillator();
      swellOsc.frequency.setValueAtTime(0.12, ctx.currentTime);
      const swellGain = ctx.createGain();
      swellGain.gain.setValueAtTime(250, ctx.currentTime);
      swellOsc.connect(swellGain);
      swellGain.connect(waveFilter.frequency);
      swellOsc.start();

      noise.connect(waveFilter);
      waveFilter.connect(soundGain);
      noise.start();

      activeNodes.push(noise, waveFilter, swellOsc, swellGain);
    } else if (type === 'binaural') {
      // 40Hz Gamma Focus Tone (216Hz Left, 256Hz Right)
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.setValueAtTime(216, ctx.currentTime);
      oscR.frequency.setValueAtTime(256, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      oscL.connect(merger, 0, 0); // Left channel
      oscR.connect(merger, 0, 1); // Right channel

      const toneGain = ctx.createGain();
      toneGain.gain.setValueAtTime(0.2, ctx.currentTime); // Keep binaural tone soft

      merger.connect(toneGain);
      toneGain.connect(soundGain);

      oscL.start();
      oscR.start();

      activeNodes.push(oscL, oscR, merger, toneGain);
    }

    // Fade in smoothly
    soundGain.gain.setTargetAtTime(0.8, ctx.currentTime, 0.4);

    this.currentSourceNodes = {
      sources: activeNodes,
      gain: soundGain,
    };
    this.currentSound = type;
  }

  /**
   * Procedural Tibetan Singing Bowl / Chime for session complete
   * Zero external mp3 required.
   */
  public playChime(success = true) {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const frequencies = success
        ? [523.25, 659.25, 783.99, 1046.5] // C Major Chord (C5, E5, G5, C6)
        : [440.0, 349.23]; // Relaxing descending tone

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        noteGain.gain.setValueAtTime(0.001, now + idx * 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.1 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 1.8);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain!);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 2.0);
      });
    } catch (e) {
      console.warn('Audio playback not permitted yet:', e);
    }
  }
}

// Export singleton
export const ambientSynth =
  typeof window !== 'undefined' ? new AmbientSynthesizer() : (null as any);
