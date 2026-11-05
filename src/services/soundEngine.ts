export type AmbientTrackId = 'RAIN' | 'FOREST' | 'WHITE_NOISE' | 'STUDY_ATMOS' | 'BROWN_DEEP';

export interface AmbientTrackMeta {
  id: AmbientTrackId;
  name: string;
  subtitle: string;
  frequencyLabel: string;
}

export const AMBIENT_TRACKS: AmbientTrackMeta[] = [
  {
    id: 'RAIN',
    name: 'Midnight Steady Rain',
    subtitle: 'Filtered pink-noise rainfall for deep reading',
    frequencyLabel: '400Hz Low-Pass Pink',
  },
  {
    id: 'FOREST',
    name: 'Mountain Forest Canopy',
    subtitle: 'Modulated breeze & organic woodland resonance',
    frequencyLabel: 'Breeze LFO + Harmonic',
  },
  {
    id: 'WHITE_NOISE',
    name: 'Pure Acoustic Shield',
    subtitle: 'Balanced spectrum noise to mask environmental chatter',
    frequencyLabel: '1.2kHz Band-Limited',
  },
  {
    id: 'STUDY_ATMOS',
    name: 'Alpha Wave Study Drone',
    subtitle: 'Warm 10Hz binaural harmonic chord for problem solving',
    frequencyLabel: '216Hz / 226Hz Alpha',
  },
  {
    id: 'BROWN_DEEP',
    name: 'Deep Library Brown Noise',
    subtitle: 'Low-frequency warmth for zero-fatigue marathon sessions',
    frequencyLabel: '180Hz Deep Roll-off',
  },
];

class FocusRiseAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientExtraNodes: AudioNode[] = [];
  private currentTrack: AmbientTrackId | null = null;
  private alarmInterval: number | null = null;
  private volume = 0.5;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setAmbientVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.volume * 0.35, this.ctx.currentTime, 0.08);
    }
  }

  public startAmbient(trackId: AmbientTrackId, volume = this.volume) {
    this.stopAmbient();
    this.volume = volume;
    const ctx = this.getContext();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(Math.max(0.02, this.volume * 0.35), ctx.currentTime + 0.4);
    masterGain.connect(ctx.destination);
    this.ambientGain = masterGain;
    this.currentTrack = trackId;

    if (trackId === 'STUDY_ATMOS') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc3.type = 'triangle';
      osc1.frequency.value = 216;
      osc2.frequency.value = 226; // 10Hz Alpha binaural beat
      osc3.frequency.value = 108;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 340;

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(masterGain);

      osc1.start();
      osc2.start();
      osc3.start();
      this.ambientExtraNodes = [osc1, osc2, osc3, filter];
      return;
    }

    // Generate 3-second looping noise buffer
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (trackId === 'BROWN_DEEP' || trackId === 'RAIN') {
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.2;
      } else {
        data[i] = white * 0.6;
      }
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    if (trackId === 'RAIN') {
      filter.type = 'bandpass';
      filter.frequency.value = 650;
      filter.Q.value = 0.7;
    } else if (trackId === 'FOREST') {
      filter.type = 'bandpass';
      filter.frequency.value = 420;
      filter.Q.value = 1.5;
      // Add subtle wind LFO modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.18;
      lfoGain.gain.value = 180;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.ambientExtraNodes.push(lfo, lfoGain);
    } else if (trackId === 'BROWN_DEEP') {
      filter.type = 'lowpass';
      filter.frequency.value = 220;
    } else {
      filter.type = 'lowpass';
      filter.frequency.value = 1400;
    }

    noise.connect(filter);
    filter.connect(masterGain);
    noise.start();
    this.ambientSource = noise;
    this.ambientExtraNodes.push(filter);
  }

  public stopAmbient() {
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioBufferSourceNode).stop();
        this.ambientSource.disconnect();
      } catch {
        // Ignore already stopped
      }
      this.ambientSource = null;
    }
    this.ambientExtraNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // Ignore
      }
    });
    this.ambientExtraNodes = [];
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch {
        // Ignore
      }
      this.ambientGain = null;
    }
    this.currentTrack = null;
  }

  public getActiveTrack(): AmbientTrackId | null {
    return this.currentTrack;
  }

  public startAlarmSound(
    soundType: 'CHAMPION_CHIME' | 'TACTICAL_PULSE' | 'DIGITAL_BELL' | 'SUNRISE_HARMONICS' | 'INTENSE_SIREN',
    gradualVolume: boolean,
    vibrate: boolean
  ) {
    this.stopAlarmSound();
    const ctx = this.getContext();
    let step = 0;

    const triggerTone = () => {
      step++;
      const gainLevel = gradualVolume ? Math.min(0.45, 0.08 + step * 0.04) : 0.4;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (soundType === 'CHAMPION_CHIME') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.14); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.28); // G5
      } else if (soundType === 'TACTICAL_PULSE') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(440, now + 0.18);
      } else if (soundType === 'DIGITAL_BELL') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1046.5, now);
      } else if (soundType === 'SUNRISE_HARMONICS') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, now);
        osc.frequency.exponentialRampToValueAtTime(648, now + 0.45);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.35);
      }

      gain.gain.setValueAtTime(gainLevel, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.58);

      if (vibrate && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch {
          // Ignore on unsupported devices
        }
      }
    };

    triggerTone();
    this.alarmInterval = window.setInterval(triggerTone, 950);
  }

  public stopAlarmSound() {
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {
        // Ignore
      }
    }
  }

  public playSuccessChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Ignore audio errors
    }
  }
}

export const soundEngine = new FocusRiseAudioEngine();
