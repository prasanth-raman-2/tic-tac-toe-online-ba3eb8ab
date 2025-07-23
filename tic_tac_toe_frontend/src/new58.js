// PUBLIC_INTERFACE
/**
 * Controls game animations and visual effects
 * Manages transitions, piece placements, and victory animations
 */
export class AnimationController {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animations = new Map();
    this.spriteSheet = null;
    this.settings = {
      duration: 300,
      easing: 'easeOutQuad',
      particleCount: 50,
      colors: ['#1976d2', '#424242', '#fbc02d']
    };
  }

  // PUBLIC_INTERFACE
  async initialize() {
    await this.loadSprites();
    this.setupCanvas();
    return this;
  }

  // PUBLIC_INTERFACE
  animate(type, params) {
    switch (type) {
      case 'place':
        return this.animatePiecePlacement(params);
      case 'win':
        return this.animateWinningLine(params);
      case 'celebrate':
        return this.animateVictoryCelebration(params);
      case 'draw':
        return this.animateGameDraw(params);
      case 'reset':
        return this.animateGameReset(params);
      default:
        return Promise.resolve();
    }
  }

  async loadSprites() {
    const spriteSheet = new Image();
    spriteSheet.src = 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#000" stroke-width="5"/>
        <path d="M75 5L95 45L55 45Z" fill="#000"/>
        <rect x="105" y="5" width="40" height="40" fill="#000"/>
      </svg>
    `);

    return new Promise((resolve, reject) => {
      spriteSheet.onload = () => {
        this.spriteSheet = spriteSheet;
        resolve();
      };
      spriteSheet.onerror = reject;
    });
  }

  setupCanvas() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  animatePiecePlacement({ piece, position, callback }) {
    return new Promise(resolve => {
      const startTime = performance.now();
      const duration = this.settings.duration;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw piece with scale and fade effect
        const scale = this.ease(progress);
        const alpha = progress;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.translate(
          position.x + position.width / 2,
          position.y + position.height / 2
        );
        this.ctx.scale(scale, scale);
        
        this.drawPiece(piece, -position.width / 2, -position.height / 2);
        
        this.ctx.restore();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (callback) callback();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  animateWinningLine({ start, end, callback }) {
    return new Promise(resolve => {
      const startTime = performance.now();
      const duration = this.settings.duration * 1.5;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw line with growing effect
        const currentEnd = {
          x: start.x + (end.x - start.x) * this.ease(progress),
          y: start.y + (end.y - start.y) * this.ease(progress)
        };
        
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(currentEnd.x, currentEnd.y);
        this.ctx.strokeStyle = this.settings.colors[0];
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (callback) callback();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  animateVictoryCelebration({ winner, callback }) {
    return new Promise(resolve => {
      const startTime = performance.now();
      const duration = this.settings.duration * 2;
      const particles = this.createParticles();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
          particle.x += particle.velocity.x;
          particle.y += particle.velocity.y;
          particle.velocity.y += 0.1; // gravity
          particle.rotation += particle.rotationSpeed;
          particle.opacity = 1 - progress;
          
          this.ctx.save();
          this.ctx.globalAlpha = particle.opacity;
          this.ctx.translate(particle.x, particle.y);
          this.ctx.rotate(particle.rotation);
          this.ctx.fillStyle = particle.color;
          this.ctx.fillRect(-2, -2, 4, 4);
          this.ctx.restore();
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (callback) callback();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  animateGameDraw({ callback }) {
    return new Promise(resolve => {
      const startTime = performance.now();
      const duration = this.settings.duration;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw crisscrossing lines effect
        const offset = this.ease(progress) * 20;
        
        this.ctx.save();
        this.ctx.globalAlpha = progress;
        this.ctx.strokeStyle = this.settings.colors[2];
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < this.canvas.width; i += 20) {
          this.ctx.beginPath();
          this.ctx.moveTo(i + offset, 0);
          this.ctx.lineTo(i - offset, this.canvas.height);
          this.ctx.stroke();
        }
        
        this.ctx.restore();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (callback) callback();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  animateGameReset({ callback }) {
    return new Promise(resolve => {
      const startTime = performance.now();
      const duration = this.settings.duration;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fade out effect with spinning
        const rotation = progress * Math.PI * 2;
        const scale = 1 - this.ease(progress);
        
        this.ctx.save();
        this.ctx.globalAlpha = 1 - progress;
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate(rotation);
        this.ctx.scale(scale, scale);
        
        // Draw board outline
        this.ctx.strokeStyle = this.settings.colors[1];
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
          -this.canvas.width / 4,
          -this.canvas.height / 4,
          this.canvas.width / 2,
          this.canvas.height / 2
        );
        
        this.ctx.restore();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (callback) callback();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  createParticles() {
    const particles = [];
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    for (let i = 0; i < this.settings.particleCount; i++) {
      const angle = (Math.PI * 2 * i) / this.settings.particleCount;
      const speed = 2 + Math.random() * 2;
      
      particles.push({
        x: centerX,
        y: centerY,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        color: this.settings.colors[Math.floor(Math.random() * this.settings.colors.length)],
        opacity: 1
      });
    }
    
    return particles;
  }

  drawPiece(piece, x, y) {
    const size = 40;
    if (piece === 'X') {
      this.ctx.strokeStyle = this.settings.colors[0];
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 10, y + 10);
      this.ctx.lineTo(x + size - 10, y + size - 10);
      this.ctx.moveTo(x + size - 10, y + 10);
      this.ctx.lineTo(x + 10, y + size - 10);
      this.ctx.stroke();
    } else {
      this.ctx.strokeStyle = this.settings.colors[1];
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.arc(
        x + size / 2,
        y + size / 2,
        size / 2 - 10,
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
    }
  }

  ease(t) {
    // easeOutQuad
    return t * (2 - t);
  }

  // PUBLIC_INTERFACE
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // PUBLIC_INTERFACE
  dispose() {
    this.clear();
    this.canvas = null;
    this.ctx = null;
    this.spriteSheet = null;
  }
}
