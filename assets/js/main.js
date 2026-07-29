/* ============================================================
   MAIN.JS — Core Init, Navbar, Lenis Scroll, Utilities
   Portfolio | AI Engineer & Full Stack Developer
   ============================================================ */

/* ── Scroll Progress Bar ──────────────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = `${Math.min(pct, 100)}%`;
  }, { passive: true });
}

/* ── Sticky Navbar ────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  const updateNavbar = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); // run on load
}

/* ── Active Nav Link (highlight current page/section) ──────── */
function initActiveNavLink() {
  const links    = document.querySelectorAll('.navbar__link, .navbar__mobile .navbar__link');
  const current  = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ── Mobile Menu ──────────────────────────────────────────── */
function initMobileMenu() {
  const toggle  = document.querySelector('.navbar__hamburger');
  const drawer  = document.querySelector('.navbar__mobile');
  const overlay = document.querySelector('.navbar__overlay');

  if (!toggle || !drawer) return;

  const open = () => {
    toggle.classList.add('open');
    drawer.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    toggle.classList.remove('open');
    drawer.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    toggle.classList.contains('open') ? close() : open();
  });

  // Close on link click
  drawer.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on overlay click
  overlay?.addEventListener('click', close);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) close();
  });
}

/* ── Lenis Smooth Scroll ──────────────────────────────────── */
function initLenis() {
  if (typeof Lenis === 'undefined') {
    console.warn('Lenis not loaded — native scroll active.');
    return null;
  }

  const lenis = new Lenis({
    duration:        1.2,
    easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel:     true,
    smoothTouch:     false,
    touchMultiplier: 2,
    wheelMultiplier: 1.0,
    infinite:        false,
  });

  // Connect Lenis to GSAP ScrollTrigger if available
  if (window.gsap && window.ScrollTrigger) {
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    // Fallback RAF loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Smooth-scroll anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      }
    });
  });

  window.lenis = lenis;
  return lenis;
}

/* ── Back To Top ──────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.querySelector('.footer__back-top');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: 1.6 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/* ── Lazy Loading Images ──────────────────────────────────── */
function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src   = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => observer.observe(img));
}

/* ── Ripple Effect on Buttons ─────────────────────────────── */
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const ripple  = document.createElement('span');
    const rect    = btn.getBoundingClientRect();
    const size    = Math.max(rect.width, rect.height);
    const x       = e.clientX - rect.left - size / 2;
    const y       = e.clientY - rect.top  - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255,255,255,0.18);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleExpand 0.55s ease-out forwards;
      pointer-events: none;
    `;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  // Inject keyframe once
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id    = 'ripple-style';
    style.textContent = `
      @keyframes rippleExpand {
        to { transform: scale(2.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ── Vanilla Tilt on Cards ────────────────────────────────── */
function initTilt() {
  if (typeof VanillaTilt === 'undefined') return;

  VanillaTilt.init(document.querySelectorAll('.card[data-tilt]'), {
    max:           8,
    speed:         400,
    glare:         true,
    'max-glare':   0.12,
    perspective:   1000,
    scale:         1.02,
    gyroscope:     false,
  });

  // Lighter tilt for project cards
  VanillaTilt.init(document.querySelectorAll('.card--project[data-tilt]'), {
    max:           5,
    speed:         500,
    glare:         true,
    'max-glare':   0.08,
    perspective:   1200,
    scale:         1.015,
    gyroscope:     false,
  });
}

/* ── Tooltip Init ─────────────────────────────────────────── */
function initTooltips() {
  // Pure CSS tooltips via [data-tooltip] — no JS needed.
  // This function is here for future enhancement (e.g. Tippy.js).
}

/* ── Page Transition Links ────────────────────────────────── */
function initPageTransitions() {
  document.querySelectorAll('a[data-transition]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;

      e.preventDefault();
      if (window.animations) {
        window.animations.pageLeave(href);
      } else {
        window.location.href = href;
      }
    });
  });
}

/* ── Copy Email to Clipboard ──────────────────────────────── */
function initCopyEmail() {
  document.querySelectorAll('[data-copy-email]').forEach(el => {
    el.addEventListener('click', () => {
      const email = el.dataset.copyEmail;
      navigator.clipboard?.writeText(email).then(() => {
        const original = el.textContent;
        el.textContent = '✅ Copied!';
        setTimeout(() => { el.textContent = original; }, 2000);
      });
    });
  });
}

/* ── Section Active Link (Intersection Observer) ─────────── */
function initSectionObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link[href*="#"], .navbar__link[href*=".html"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;

      navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        link.classList.toggle('active', href.includes(id));
      });
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}

/* ── Gallery Lightbox ───────────────────────────────────── */
function initGalleryLightbox() {
  const backdrop = document.getElementById('gallery-lightbox');
  const items = document.querySelectorAll('.gallery-masonry .gallery-item');
  if (!backdrop || !items.length) return;

  const imageEl = backdrop.querySelector('.lightbox-image');
  const captionEl = backdrop.querySelector('.lightbox-caption');
  const counterEl = backdrop.querySelector('.lightbox-counter');
  const prevBtn = backdrop.querySelector('.lightbox-prev');
  const nextBtn = backdrop.querySelector('.lightbox-next');
  const closeBtn = backdrop.querySelector('.lightbox-close');

  const images = Array.from(items).map(item => {
    const img = item.querySelector('img');
    return {
      src: img?.getAttribute('src') || '',
      alt: img?.getAttribute('alt') || 'Portfolio gallery image',
      node: item,
    };
  });

  let currentIndex = 0;

  const updateLightbox = (index) => {
    currentIndex = (index + images.length) % images.length;
    const current = images[currentIndex];
    imageEl.src = current.src;
    imageEl.alt = current.alt;
    captionEl.textContent = current.alt;
    counterEl.textContent = `${currentIndex + 1} / ${images.length}`;
  };

  const openLightbox = (index) => {
    updateLightbox(index);
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  items.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  prevBtn?.addEventListener('click', () => updateLightbox(currentIndex - 1));
  nextBtn?.addEventListener('click', () => updateLightbox(currentIndex + 1));
  closeBtn?.addEventListener('click', closeLightbox);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!backdrop.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') updateLightbox(currentIndex + 1);
    if (e.key === 'ArrowLeft') updateLightbox(currentIndex - 1);
  });
}

/* ── Modal System ─────────────────────────────────────────── */
function initModals() {
  // Open
  document.querySelectorAll('[data-modal-open]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const id = trigger.dataset.modalOpen;
      const backdrop = document.getElementById(id);
      if (backdrop) {
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        backdrop.querySelector('[autofocus]')?.focus();
      }
    });
  });

  // Close
  document.querySelectorAll('[data-modal-close], .modal-backdrop').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || el.matches('[data-modal-close]')) {
        const backdrop = el.closest('.modal-backdrop') || document.querySelector('.modal-backdrop.open');
        if (backdrop) {
          backdrop.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(b => {
        b.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
  });
}

/* ── Preloader ────────────────────────────────────────────── */
function initPreloader() {
  // Fallback — hide loader after 2.5s maximum regardless of GSAP
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  const hide = () => {
    if (!loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
    }
  };

  // Primary: hide on window load + small delay for animation
  window.addEventListener('load', () => setTimeout(hide, 2000));

  // Safety net: force hide after 4s
  setTimeout(hide, 4000);
}

/* ── Main Entry ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavbar();
  initActiveNavLink();
  initMobileMenu();
  initLenis();
  initBackToTop();
  initLazyLoad();
  initRipple();
  initTilt();
  initTooltips();
  initPageTransitions();
  initCopyEmail();
  initSectionObserver();
  initGalleryLightbox();
  initModals();
  initPreloader(); // start preloader timeout on DOM ready
});

/* ── Utility: debounce ────────────────────────────────────── */
window.debounce = (fn, delay = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/* ── Utility: throttle ────────────────────────────────────── */
window.throttle = (fn, limit = 100) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= limit) { last = now; fn(...args); }
  };
};

window.addEventListener('load', () => {
  // Re-init tilt after images and fonts load
  setTimeout(initTilt, 400);
});
