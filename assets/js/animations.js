/* ============================================================
   ANIMATIONS.JS — GSAP + AOS Scroll Reveal System
   Portfolio | AI Engineer & Full Stack Developer
   ============================================================ */

class AnimationSystem {
  constructor() {
    this.gsap     = window.gsap    || null;
    this.ScrollTrigger = (window.gsap && window.ScrollTrigger) ? window.ScrollTrigger : null;
    this.aosReady = false;
    this.init();
  }

  /* ── Init ──────────────────────────────────────────────── */
  init() {
    if (!this.gsap) {
      console.warn('GSAP not loaded — falling back to CSS animations.');
      this.initAOSFallback();
      return;
    }

    // Register plugins
    if (window.ScrollTrigger) {
      this.gsap.registerPlugin(window.ScrollTrigger);
      this.ScrollTrigger = window.ScrollTrigger;
    }

    if (window.TextPlugin) {
      this.gsap.registerPlugin(window.TextPlugin);
    }

    document.addEventListener('DOMContentLoaded', () => {
      this.runPageEnter();
      this.setupScrollReveal();
      this.setupHeroAnimations();
      this.setupNavbarAnimation();
      this.setupCounters();
      this.setupProgressBars();
      this.setupStaggerGrids();
      this.initAOS();
    });
  }

  /* ── Page Enter Transition ─────────────────────────────── */
  runPageEnter() {
    const tl = this.gsap.timeline();
    tl.from('body', { opacity: 0, duration: 0.01 })
      .to('#page-loader', {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 1.6,
        onComplete: () => {
          const loader = document.getElementById('page-loader');
          if (loader) {
            loader.classList.add('hidden');
            document.body.classList.remove('loading');
          }
        }
      })
      .from('#page-wrapper', {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: 'power3.out',
      }, '-=0.3');
  }

  /* ── Scroll Reveal (ScrollTrigger) ────────────────────── */
  setupScrollReveal() {
    if (!this.ScrollTrigger) return;

    // Generic .reveal-hidden elements
    this.gsap.utils.toArray('.reveal-hidden').forEach((el) => {
      this.gsap.to(el, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      });
    });

    // Section headers
    this.gsap.utils.toArray('.section__header, .section-title-wrap').forEach(el => {
      const eyebrow  = el.querySelector('.eyebrow, .section__eyebrow');
      const title    = el.querySelector('.section__title, h2');
      const subtitle = el.querySelector('.section__subtitle, p');
      const divider  = el.querySelector('.divider');

      const tl = this.gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      });

      if (eyebrow)  tl.from(eyebrow,  { opacity:0, y:20, duration:0.5, ease:'power2.out' });
      if (title)    tl.from(title,    { opacity:0, y:30, duration:0.6, ease:'power3.out' }, '-=0.2');
      if (subtitle) tl.from(subtitle, { opacity:0, y:20, duration:0.5, ease:'power2.out' }, '-=0.3');
      if (divider)  tl.from(divider,  { scaleX:0, duration:0.5, ease:'power2.out' },        '-=0.2');
    });
  }

  /* ── Hero Entrance ─────────────────────────────────────── */
  setupHeroAnimations() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const tl = this.gsap.timeline({ delay: 1.8 });

    const eyebrow  = hero.querySelector('.hero__eyebrow');
    const heading  = hero.querySelector('.hero__heading');
    const typed    = hero.querySelector('.hero__typed-wrap');
    const desc     = hero.querySelector('.hero__desc');
    const cta      = hero.querySelector('.hero__cta');
    const social   = hero.querySelector('.hero__social');
    const scroll   = hero.querySelector('.hero__scroll');
    const visual   = hero.querySelector('.hero__visual');
    const stats    = hero.querySelectorAll('.hero__stat');

    if (eyebrow)  tl.from(eyebrow,  { opacity:0, y:24, duration:0.6, ease:'power3.out' });
    if (heading)  tl.from(heading,  { opacity:0, y:36, duration:0.7, ease:'power3.out' }, '-=0.3');
    if (typed)    tl.from(typed,    { opacity:0, y:20, duration:0.5, ease:'power2.out' }, '-=0.2');
    if (desc)     tl.from(desc,     { opacity:0, y:20, duration:0.5, ease:'power2.out' }, '-=0.3');
    if (cta)      tl.from(cta,      { opacity:0, y:20, duration:0.5, ease:'back.out(1.4)' }, '-=0.2');
    if (social)   tl.from(social,   { opacity:0, x:-20, duration:0.5, ease:'power2.out' }, '-=0.3');
    if (visual)   tl.from(visual,   { opacity:0, x:40, duration:0.8, ease:'power3.out' }, '-=0.6');
    if (stats.length) tl.from(stats, { opacity:0, y:20, stagger:0.1, duration:0.5, ease:'power2.out' }, '-=0.4');
    if (scroll)   tl.from(scroll,   { opacity:0, y:10, duration:0.5, ease:'power2.out' }, '-=0.2');
  }

  /* ── Navbar Scroll Effect ──────────────────────────────── */
  setupNavbarAnimation() {
    // Handled by main.js via scroll listener; GSAP handles initial show
    const navbar = document.querySelector('.navbar');
    if (!navbar || !this.gsap) return;

    this.gsap.from(navbar, {
      y: -80,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      delay: 1.4,
    });
  }

  /* ── Animated Counters ─────────────────────────────────── */
  setupCounters() {
    if (!this.ScrollTrigger) return;

    document.querySelectorAll('[data-counter]').forEach(el => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.counterSuffix || '';
      const decimals = el.dataset.counterDecimals ? parseInt(el.dataset.counterDecimals) : 0;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          this.gsap.fromTo(
            { val: 0 },
            { val: target,
              duration: 2,
              ease: 'power2.out',
              onUpdate: function() {
                el.textContent = this.targets()[0].val.toFixed(decimals) + suffix;
              }
            }
          );
        }
      });
    });
  }

  /* ── Progress Bars ─────────────────────────────────────── */
  setupProgressBars() {
    if (!this.ScrollTrigger) return;

    document.querySelectorAll('.progress-bar__fill').forEach(bar => {
      const pct = bar.dataset.width || '0%';
      ScrollTrigger.create({
        trigger: bar,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          this.gsap.to(bar, {
            width: pct,
            duration: 1.2,
            ease: 'power3.out',
          });
        }
      });
    });
  }

  /* ── Stagger Grids (cards, chips, tags) ─────────────────── */
  setupStaggerGrids() {
    if (!this.ScrollTrigger) return;

    const staggerGroups = [
      { selector: '.grid-2 .card',   stagger: 0.10 },
      { selector: '.grid-3 .card',   stagger: 0.08 },
      { selector: '.grid-4 .card',   stagger: 0.06 },
      { selector: '.grid-auto .card',stagger: 0.07 },
      { selector: '.skill-chip',     stagger: 0.04 },
      { selector: '.timeline-card',  stagger: 0.12 },
    ];

    staggerGroups.forEach(({ selector, stagger }) => {
      const els = document.querySelectorAll(selector);
      if (!els.length) return;

      // Group by parent container
      const parents = new Set([...els].map(el => el.parentElement));
      parents.forEach(parent => {
        const children = parent.querySelectorAll(selector.split(' ').pop());
        if (!children.length) return;

        this.gsap.from(children, {
          opacity: 0,
          y: 32,
          duration: 0.6,
          stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: parent,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        });
      });
    });
  }

  /* ── AOS Init ──────────────────────────────────────────── */
  initAOS() {
    if (typeof AOS === 'undefined') return;

    AOS.init({
      duration:   700,
      easing:     'ease-out-cubic',
      once:       true,
      offset:     60,
      delay:      0,
      anchorPlacement: 'top-bottom',
    });

    this.aosReady = true;
  }

  /* ── Pure CSS fallback (no GSAP) ───────────────────────── */
  initAOSFallback() {
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 700, once: true, offset: 60 });
      }

      // IntersectionObserver for .reveal-hidden
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
            entry.target.style.opacity    = '1';
            entry.target.style.transform  = 'none';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.reveal-hidden').forEach(el => observer.observe(el));
    });
  }

  /* ── Page Leave Transition ─────────────────────────────── */
  pageLeave(href) {
    if (!this.gsap) {
      window.location.href = href;
      return;
    }

    this.gsap.to('#page-wrapper', {
      opacity: 0,
      y: -16,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => { window.location.href = href; }
    });
  }
}

/* ── Text Scramble Effect ─────────────────────────────────── */
class TextScramble {
  constructor(el) {
    this.el     = el;
    this.chars  = '!<>-_\\/[]{}—=+*^?#@abcdefghijklmnopqrstuvwxyz';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const old = this.el.innerText;
    const len = Math.max(old.length, newText.length);
    return new Promise(resolve => {
      this.queue = [];
      for (let i = 0; i < len; i++) {
        const from  = old[i]    || '';
        const to    = newText[i] || '';
        const start = Math.floor(Math.random() * 14);
        const end   = start + Math.floor(Math.random() * 14);
        this.queue.push({ from, to, start, end, char: '' });
      }
      cancelAnimationFrame(this.frameId);
      this.frame    = 0;
      this.resolve  = resolve;
      this.update();
    });
  }

  update() {
    let output  = '';
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      const { from, to, start, end } = this.queue[i];
      let   { char } = this.queue[i];

      if (this.frame >= end) {
        complete++;
        output += `<span style="color:var(--text-primary)">${to}</span>`;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="color:var(--color-accent);opacity:.7">${char}</span>`;
      } else {
        output += `<span style="opacity:.3">${from}</span>`;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameId = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

/* ── Typed.js Init Helper ─────────────────────────────────── */
function initTyped(selector, strings, options = {}) {
  if (typeof Typed === 'undefined') return null;

  return new Typed(selector, {
    strings,
    typeSpeed:     55,
    backSpeed:     30,
    backDelay:     1800,
    startDelay:    400,
    loop:          true,
    showCursor:    true,
    cursorChar:    '|',
    smartBackspace:true,
    ...options,
  });
}

/* ── Export ───────────────────────────────────────────────── */
window.AnimationSystem = AnimationSystem;
window.TextScramble    = TextScramble;
window.initTyped       = initTyped;
window.animations      = new AnimationSystem();

// Display the actual values even if the external GSAP files cannot be loaded.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const value = Number.parseFloat(el.dataset.counter);
    if (!Number.isFinite(value)) return;

    const decimals = Number.parseInt(el.dataset.counterDecimals || '0', 10);
    el.textContent = value.toFixed(decimals) + (el.dataset.counterSuffix || '');
  });
});
