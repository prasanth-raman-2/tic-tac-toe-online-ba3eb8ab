// PUBLIC_INTERFACE
export class GameAnimations {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animations = new Map();
    this.isPlaying = false;
  }

  // PUBLIC_INTERFACE
  drawWinningLine(startX, startY, endX, endY, color = '#1976d2') {
    const animation = {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      progress: 0,
      color: color
    };

    this.animations.set('winLine', animation);
    this.animate();
  }

  // PUBLIC_INTERFACE
  celebrateWin() {
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * this.canvas.width,
      y: this.canvas.height + 10,
      radius: Math.random() * 3 + 1,
      color: this.getRandomColor(),
      velocity: {
        x: Math.random() * 6 - 3,
        y: -Math.random() * 15 - 10
      },
      opacity: 1
    }));

    this.animations.set('celebration', { particles });
    this.animate();
  }

  // PUBLIC_INTERFACE
  animateMove(x, y, symbol) {
    const animation = {
      x,
      y,
      symbol,
      scale: 0,
      opacity: 0
    };

    this.animations.set('move', animation);
    this.animate();
  }

  animate() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.animationFrame();
  }

  animationFrame() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let continueAnimation = false;

    // Animate winning line
    if (this.animations.has('winLine')) {
      continueAnimation = this.animateWinningLine() || continueAnimation;
    }

    // Animate celebration particles
    if (this.animations.has('celebration')) {
      continueAnimation = this.animateCelebration() || continueAnimation;
    }

    // Animate move
    if (this.animations.has('move')) {
      continueAnimation = this.animatePlayerMove() || continueAnimation;
    }

    if (continueAnimation) {
      requestAnimationFrame(() => this.animationFrame());
    } else {
      this.isPlaying = false;
    }
  }

  animateWinningLine() {
    const animation = this.animations.get('winLine');
    if (animation.progress >= 1) {
      this.animations.delete('winLine');
      return false;
    }

    const currentX = animation.start.x + (animation.end.x - animation.start.x) * animation.progress;
    const currentY = animation.start.y + (animation.end.y - animation.start.y) * animation.progress;

    this.ctx.beginPath();
    this.ctx.moveTo(animation.start.x, animation.start.y);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.strokeStyle = animation.color;
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    animation.progress += 0.05;
    return true;
  }

  animateCelebration() {
    const animation = this.animations.get('celebration');
    let activeParticles = false;

    animation.particles.forEach((particle, index) => {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.velocity.y += 0.5; // gravity
      particle.opacity -= 0.01;

      if (particle.opacity > 0) {
        activeParticles = true;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity})`;
        this.ctx.fill();
      }
    });

    if (!activeParticles) {
      this.animations.delete('celebration');
    }

    return activeParticles;
  }

  animatePlayerMove() {
    const animation = this.animations.get('move');
    if (animation.scale >= 1) {
      this.animations.delete('move');
      return false;
    }

    this.ctx.save();
    this.ctx.translate(animation.x, animation.y);
    this.ctx.scale(animation.scale, animation.scale);
    this.ctx.globalAlpha = animation.opacity;

    // Draw symbol
    this.ctx.strokeStyle = animation.symbol === 'X' ? '#1976d2' : '#424242';
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';

    if (animation.symbol === 'X') {
      this.drawX(-25, -25, 50);
    } else {
      this.drawO(0, 0, 25);
    }

    this.ctx.restore();

    animation.scale += 0.1;
    animation.opacity = Math.min(1, animation.opacity + 0.1);

    return true;
  }

  drawX(x, y, size) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + size, y + size);
    this.ctx.moveTo(x + size, y);
    this.ctx.lineTo(x, y + size);
    this.ctx.stroke();
  }

  drawO(x, y, radius) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  getRandomColor() {
    const colors = [
      '255, 99, 71',   // Tomato
      '65, 105, 225',  // Royal Blue
      '50, 205, 50',   // Lime Green
      '255, 215, 0',   // Gold
      '238, 130, 238', // Violet
      '255, 140, 0'    // Dark Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // PUBLIC_INTERFACE
  clear() {
    this.animations.clear();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.isPlaying = false;
  }
}
