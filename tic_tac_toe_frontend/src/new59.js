// PUBLIC_INTERFACE
/**
 * Manages game sound effects and audio feedback
 * Handles sound loading, playing, and volume control
 */
export class SoundManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = new Map();
    this.settings = {
      masterVolume: 0.7,
      enabled: true,
      fadeTime: 0.1
    };

    // Define sound configurations
    this.soundConfigs = {
      move: {
        type: 'oscillator',
        options: {
          frequency: 440,
          duration: 0.1,
          type: 'sine'
        }
      },
      win: {
        type: 'oscillator',
        options: {
          frequency: [523.25, 659.25, 783.99], // C5, E5, G5
          duration: 0.3,
          type: 'triangle'
        }
      },
      draw: {
        type: 'oscillator',
        options: {
          frequency: [440, 349.23], // A4, F4
          duration: 0.2,
          type: 'square'
        }
      },
      click: {
        type: 'oscillator',
        options: {
          frequency: 880,
          duration: 0.05,
          type: 'sine'
        }
      }
    };
  }

  // PUBLIC_INTERFACE
  async initialize() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    return this;
  }

  // PUBLIC_INTERFACE
  async play(soundName) {
    if (!this.settings.enabled) return;

    const config = this.soundConfigs[soundName];
    if (!config) return;

    switch (config.type) {
      case 'oscillator':
        await this.playOscillator(config.options);
        break;
      default:
        console.warn(`Unknown sound type: ${config.type}`);
    }
  }

  async playOscillator(options) {
    const { frequency, duration, type } = options;

    if (Array.isArray(frequency)) {
      // Play chord
      await Promise.all(frequency.map(freq => 
        this.playOscillator({
          frequency: freq,
          duration,
          type
        })
      ));
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    
    gainNode.gain.setValueAtTime(
      0,
      this.audioContext.currentTime
    );
    gainNode.gain.linearRampToValueAtTime(
      this.settings.masterVolume,
      this.audioContext.currentTime + this.settings.fadeTime
    );
    gainNode.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + duration
    );
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(
      this.audioContext.currentTime + duration + this.settings.fadeTime
    );

    return new Promise(resolve => {
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
        resolve();
      };
    });
  }

  // PUBLIC_INTERFACE
  setVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // PUBLIC_INTERFACE
  toggle() {
    this.settings.enabled = !this.settings.enabled;
    return this.settings.enabled;
  }

  // PUBLIC_INTERFACE
  async playSequence(sequence) {
    if (!this.settings.enabled) return;

    for (const { sound, delay } of sequence) {
      await this.play(sound);
      if (delay) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // PUBLIC_INTERFACE
  async playVictorySequence() {
    return this.playSequence([
      { sound: 'win', delay: 300 },
      { sound: 'win', delay: 300 },
      { sound: 'win' }
    ]);
  }

  // PUBLIC_INTERFACE
  async playDrawSequence() {
    return this.playSequence([
      { sound: 'draw', delay: 200 },
      { sound: 'draw' }
    ]);
  }

  // PUBLIC_INTERFACE
  dispose() {
    this.audioContext.close();
    this.sounds.clear();
  }
}
