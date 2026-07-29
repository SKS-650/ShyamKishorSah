/* ============================================================
   PARTICLES.JS — Lightweight Canvas Particle Background
   Portfolio | AI Engineer & Full Stack Developer
   Pure canvas — no library dependency for this module.
   ============================================================ */

class ParticleSystem {
  constructor(canvasId = 'particles-canvas') {
    this.canvas    = null;
    this.ctx       = null;
    this.particles = [];
    this.mouse     = { x: null, y: null, radius: 120 };
    this.rafId     = null;
    this.paused    = false;
    this.config    = {
      count:        80,          // number of particles
      minSize:      1,
      maxSize:      2.5,
      speed:        0.35,
      connectDist:  130,         // px — draw line if closer
      connectOpacity: 0.12,
      colors: [
        'rgba(37, 99, 235,',    // primary blue
        'rgba(124, 58, 237,',   // secondary purple
        'rgba(6, 182, 212,',    // accent cyan
      ],
      repelStrength: 50,
      fadeIn: true,
    };

    this.init(canvasId);
  }

  /* ── Setup ─────────────────────────────────────────────── */
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      // Create canvas if it doesn't exist
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      this.canvas.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        z-index: 1; pointer-events: none;
      `;
      document.body.appendChild(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.spawnParticles();
    this.bindEvents();

    // Pause when tab is hidden (performance)
    document.addEventListener('visibilitychange', () => {
      this.paused = document.hidden;
      if (!this.paused) this.loop();
    });

    this.loop();
  }

  /* ── Resize ────────────────────────────────────────────── */
  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /* ── Spawn ─────────────────────────────────────────────── */
  spawnParticles() {
    this.particles = [];
    const { count, minSize, maxSize, speed, colors } = this.config;

    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x:      Math.random() * this.canvas.width,
        y:      Math.random() * this.canvas.height,
        vx:     (Math.random() - 0.5) * speed * 2,
        vy:     (Math.random() - 0.5) * speed * 2,
        size:   minSize + Math.random() * (maxSize - minSize),
        color,
        opacity: this.config.fadeIn ? 0 : 0.7,
        targetOpacity: 0.5 + Math.random() * 0.5,
        pulse:  Math.random() * Math.PI * 2, // phase offset for pulsing
      });
    }
  }

  /* ── Events ────────────────────────────────────────────── */
  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.spawnParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  /* ── Update Particle ───────────────────────────────────── */
  updateParticle(p) {
    p.pulse += 0.02;

    // Fade in
    if (p.opacity < p.targetOpacity) {
      p.opacity = Math.min(p.targetOpacity, p.opacity + 0.008);
    }

    // Mouse repel
    if (this.mouse.x !== null) {
      const dx    = p.x - this.mouse.x;
      const dy    = p.y - this.mouse.y;
      const dist  = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.mouse.radius) {
        const force  = (this.mouse.radius - dist) / this.mouse.radius;
        const angle  = Math.atan2(dy, dx);
        const repel  = force * this.config.repelStrength * 0.015;
        p.vx += Math.cos(angle) * repel;
        p.vy += Math.sin(angle) * repel;
      }
    }

    // Velocity damping
    p.vx *= 0.98;
    p.vy *= 0.98;

    // Speed clamp
    const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const maxSpd = this.config.speed * 2.5;
    if (spd > maxSpd) {
      p.vx = (p.vx / spd) * maxSpd;
      p.vy = (p.vy / spd) * maxSpd;
    }

    // Ensure minimum drift
    if (spd < 0.05) {
      p.vx += (Math.random() - 0.5) * 0.1;
      p.vy += (Math.random() - 0.5) * 0.1;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Wrap around edges
    if (p.x < -10) p.x = this.canvas.width  + 10;
    if (p.x > this.canvas.width  + 10) p.x = -10;
    if (p.y < -10) p.y = this.canvas.height + 10;
    if (p.y > this.canvas.height + 10) p.y = -10;
  }

  /* ── Draw Particle ─────────────────────────────────────── */
  drawParticle(p) {
    const pulsedSize = p.size + Math.sin(p.pulse) * 0.3;
    const pulsedOp   = p.opacity * (0.8 + Math.sin(p.pulse * 0.7) * 0.2);

    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, pulsedSize, 0, Math.PI * 2);
    this.ctx.fillStyle = `${p.color}${pulsedOp})`;
    this.ctx.fill();
  }

  /* ── Draw Connections ──────────────────────────────────── */
  drawConnections() {
    const { particles, ctx, config } = this;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a  = particles[i];
        const b  = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.connectDist) {
          const opacity = config.connectOpacity * (1 - dist / config.connectDist);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          // Blend both particle colors for the line
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, `${a.color}${opacity})`);
          grad.addColorStop(1, `${b.color}${opacity})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  /* ── Main Loop ─────────────────────────────────────────── */
  loop() {
    if (this.paused) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => this.updateParticle(p));
    this.drawConnections();
    this.particles.forEach(p => this.drawParticle(p));

    this.rafId = requestAnimationFrame(() => this.loop());
  }

  /* ── Destroy ───────────────────────────────────────────── */
  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.canvas?.remove();
  }
}

/* ── Floating Gradient Blobs (CSS-driven, JS-enhanced) ──── */
class BlobBackground {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    this.container = document.querySelector('.bg-blobs');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'bg-blobs';
      this.container.setAttribute('aria-hidden', 'true');
      document.body.insertAdjacentElement('afterbegin', this.container);
    }

    this.container.innerHTML = `
      <div class="bg-blob bg-blob--1"></div>
      <div class="bg-blob bg-blob--2"></div>
      <div class="bg-blob bg-blob--3"></div>
    `;
  }
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Reduced motion check
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced) {
    window.particleSystem = new ParticleSystem('particles-canvas');
  }

  window.blobBackground = new BlobBackground();
});
