// PUBLIC_INTERFACE
export class SoundEffects {
  constructor() {
    this.sounds = new Map();
    this.isMuted = false;
    this.volume = 0.5;
    
    // Initialize audio contexts for different sound effects
    this.initializeSounds();
  }

  initializeSounds() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator-based sound effects
    this.sounds.set('move', this.createMoveSound(audioContext));
    this.sounds.set('win', this.createWinSound(audioContext));
    this.sounds.set('draw', this.createDrawSound(audioContext));
    this.sounds.set('click', this.createClickSound(audioContext));
  }

  createMoveSound(audioContext) {
    return () => {
      if (this.isMuted) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    };
  }

  createWinSound(audioContext) {
    return () => {
      if (this.isMuted) return;
      
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
        gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + index * 0.1 + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.3);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3);
      });
    };
  }

  createDrawSound(audioContext) {
    return () => {
      if (this.isMuted) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(220, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    };
  }

  createClickSound(audioContext) {
    return () => {
      if (this.isMuted) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(this.volume * 0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
    };
  }

  // PUBLIC_INTERFACE
  playSound(soundName) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound();
    }
  }

  // PUBLIC_INTERFACE
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // PUBLIC_INTERFACE
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    return this.volume;
  }
}
