/* ============================================================
   CURSOR.JS — Custom Animated Cursor & Magnetic Effects
   Portfolio | AI Engineer & Full Stack Developer
   ============================================================ */

class CustomCursor {
  constructor() {
    this.cursor     = null;
    this.follower   = null;
    this.mouseX     = 0;
    this.mouseY     = 0;
    this.followerX  = 0;
    this.followerY  = 0;
    this.isVisible  = false;
    this.isHovering = false;
    this.rafId      = null;
    this.speed      = 0.12; // follower lag (0–1, lower = laggier)

    // Only activate on non-touch devices
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      this.init();
    }
  }

  /* ── Build DOM ─────────────────────────────────────────── */
  createElements() {
    // Main dot cursor
    this.cursor = document.createElement('div');
    this.cursor.id = 'cursor';
    this.cursor.setAttribute('aria-hidden', 'true');
    this.cursor.innerHTML = `<div class="cursor__dot"></div>`;

    // Larger trailing ring
    this.follower = document.createElement('div');
    this.follower.id = 'cursor-follower';
    this.follower.setAttribute('aria-hidden', 'true');
    this.follower.innerHTML = `<div class="cursor__ring"></div>`;

    document.body.appendChild(this.cursor);
    document.body.appendChild(this.follower);

    this.injectStyles();
  }

  /* ── Inject Cursor CSS ─────────────────────────────────── */
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #cursor,
      #cursor-follower {
        position: fixed;
        top: 0; left: 0;
        pointer-events: none;
        z-index: var(--z-cursor, 9999);
        will-change: transform;
        transition: opacity 0.3s ease;
      }

      .cursor__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #fff;
        transform: translate(-50%, -50%);
        transition: width 0.2s ease, height 0.2s ease, background 0.2s ease;
        mix-blend-mode: difference;
      }

      .cursor__ring {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1.5px solid rgba(37, 99, 235, 0.7);
        transform: translate(-50%, -50%);
        transition: width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    border-color 0.2s ease,
                    opacity 0.2s ease,
                    background 0.2s ease;
      }

      /* Hover state — dot grows, ring expands */
      #cursor.is-hovering .cursor__dot {
        width: 12px;
        height: 12px;
        background: var(--color-primary, #2563EB);
        mix-blend-mode: normal;
      }

      #cursor-follower.is-hovering .cursor__ring {
        width: 54px;
        height: 54px;
        border-color: rgba(37, 99, 235, 0.5);
        background: rgba(37, 99, 235, 0.06);
      }

      /* Click state */
      #cursor.is-clicking .cursor__dot {
        width: 6px;
        height: 6px;
        background: var(--color-accent, #06B6D4);
      }

      #cursor-follower.is-clicking .cursor__ring {
        width: 28px;
        height: 28px;
        border-color: rgba(6, 182, 212, 0.8);
      }

      /* Text cursor state */
      #cursor.is-text .cursor__dot {
        width: 3px;
        height: 22px;
        border-radius: 2px;
        background: #fff;
        mix-blend-mode: difference;
      }

      #cursor-follower.is-text .cursor__ring {
        opacity: 0;
      }

      /* Hidden state */
      #cursor.is-hidden,
      #cursor-follower.is-hidden {
        opacity: 0;
      }

      /* Magnetic target indicator */
      #cursor-follower.is-magnetic .cursor__ring {
        width: 64px;
        height: 64px;
        border-color: rgba(124, 58, 237, 0.6);
        background: rgba(124, 58, 237, 0.05);
        border-width: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Track Mouse ───────────────────────────────────────── */
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (!this.isVisible) {
        this.show();
      }
    });

    document.addEventListener('mouseenter', () => this.show());
    document.addEventListener('mouseleave', () => this.hide());

    document.addEventListener('mousedown', () => {
      this.cursor.classList.add('is-clicking');
      this.follower.classList.add('is-clicking');
    });

    document.addEventListener('mouseup', () => {
      this.cursor.classList.remove('is-clicking');
      this.follower.classList.remove('is-clicking');
    });

    // Interactive element detection
    this.observeHoverTargets();
  }

  /* ── Hover Target Observer ─────────────────────────────── */
  observeHoverTargets() {
    const hoverSelectors = [
      'a', 'button', '[role="button"]', '.btn',
      '.card', '.navbar__logo', '.footer__back-top',
      'input[type="submit"]', 'label', 'select',
      '.skill-chip', '.tag', '.badge'
    ].join(', ');

    const textSelectors = 'input[type="text"], input[type="email"], textarea';
    const magneticSelectors = '.btn--primary, .btn--gradient, .btn--glow, .magnetic';

    document.addEventListener('mouseover', (e) => {
      const hoverEl  = e.target.closest(hoverSelectors);
      const textEl   = e.target.closest(textSelectors);
      const magnetEl = e.target.closest(magneticSelectors);

      if (textEl) {
        this.setMode('text');
      } else if (magnetEl) {
        this.setMode('magnetic');
      } else if (hoverEl) {
        this.setMode('hover');
      } else {
        this.setMode('default');
      }
    });
  }

  setMode(mode) {
    const modes = ['is-hovering', 'is-text', 'is-magnetic'];
    modes.forEach(m => {
      this.cursor.classList.remove(m);
      this.follower.classList.remove(m);
    });

    if (mode === 'hover') {
      this.cursor.classList.add('is-hovering');
      this.follower.classList.add('is-hovering');
    } else if (mode === 'text') {
      this.cursor.classList.add('is-text');
      this.follower.classList.add('is-text');
    } else if (mode === 'magnetic') {
      this.cursor.classList.add('is-hovering');
      this.follower.classList.add('is-magnetic');
    }
  }

  show() {
    this.isVisible = true;
    this.cursor.classList.remove('is-hidden');
    this.follower.classList.remove('is-hidden');
  }

  hide() {
    this.isVisible = false;
    this.cursor.classList.add('is-hidden');
    this.follower.classList.add('is-hidden');
  }

  /* ── RAF Animation Loop ────────────────────────────────── */
  animate() {
    // Cursor snaps instantly
    this.cursor.style.transform = `translate(${this.mouseX}px, ${this.mouseY}px)`;

    // Follower lerps toward cursor
    this.followerX += (this.mouseX - this.followerX) * this.speed;
    this.followerY += (this.mouseY - this.followerY) * this.speed;
    this.follower.style.transform = `translate(${this.followerX}px, ${this.followerY}px)`;

    this.rafId = requestAnimationFrame(() => this.animate());
  }

  /* ── Magnetic Pull Effect ──────────────────────────────── */
  initMagnetic() {
    document.querySelectorAll('.magnetic, .btn--primary, .btn--gradient').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect   = el.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = e.clientX - cx;
        const dy     = e.clientY - cy;
        const dist   = Math.sqrt(dx * dx + dy * dy);
        const maxPull = 18;
        const pull   = Math.min(maxPull, maxPull * (1 - dist / 120));

        el.style.transform = `translate(${(dx / dist) * pull}px, ${(dy / dist) * pull}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => { el.style.transition = ''; }, 500);
      });
    });
  }

  /* ── Init ──────────────────────────────────────────────── */
  init() {
    this.createElements();
    this.bindEvents();
    this.animate();

    // Delay magnetic until DOM is populated
    document.addEventListener('DOMContentLoaded', () => this.initMagnetic());
    // Re-run after any dynamic content loads
    window.addEventListener('load', () => this.initMagnetic());
  }

  /* ── Destroy ───────────────────────────────────────────── */
  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.cursor?.remove();
    this.follower?.remove();
  }
}

/* ── Mouse Glow Follower ──────────────────────────────────── */
class MouseGlow {
  constructor() {
    this.el = null;
    this.x  = 0;
    this.y  = 0;
    this.init();
  }

  init() {
    this.el = document.createElement('div');
    this.el.className = 'mouse-glow';
    this.el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.el);

    document.addEventListener('mousemove', (e) => {
      this.x = e.clientX;
      this.y = e.clientY;
      this.el.style.transform = `translate(${this.x}px, ${this.y}px) translate(-50%, -50%)`;
    });
  }
}

/* ── Export / Init ────────────────────────────────────────── */
window.customCursor = new CustomCursor();
window.mouseGlow    = new MouseGlow();
