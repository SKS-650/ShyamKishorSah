/* ============================================================
   THEME.JS — Dark / Light Theme Toggle
   Portfolio | AI Engineer & Full Stack Developer
   ============================================================ */

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'portfolio-theme';
    this.DARK        = 'dark';
    this.LIGHT       = 'light';
    this.current     = this.DARK;
    this.toggleBtns  = [];
    this.init();
  }

  /* ── Detect Preferred Theme ────────────────────────────── */
  getPreferred() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === this.DARK || saved === this.LIGHT) return saved;

    // Respect OS preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return this.LIGHT;
    }
    return this.DARK;
  }

  /* ── Apply Theme ───────────────────────────────────────── */
  apply(theme, animate = false) {
    const root = document.documentElement;
    this.current = theme;

    if (animate) {
      // Smooth theme crossfade using View Transitions API if available
      if (document.startViewTransition) {
        document.startViewTransition(() => this._setTheme(root, theme));
      } else {
        root.style.transition = 'background-color 0.4s ease, color 0.4s ease';
        this._setTheme(root, theme);
        setTimeout(() => { root.style.transition = ''; }, 450);
      }
    } else {
      this._setTheme(root, theme);
    }

    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateToggleIcons(theme);
    this.dispatchEvent(theme);
  }

  _setTheme(root, theme) {
    if (theme === this.LIGHT) {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }

  /* ── Toggle ────────────────────────────────────────────── */
  toggle() {
    this.apply(
      this.current === this.DARK ? this.LIGHT : this.DARK,
      true
    );
  }

  /* ── Update Button Icons ───────────────────────────────── */
  updateToggleIcons(theme) {
    this.toggleBtns.forEach(btn => {
      const iconLight = btn.querySelector('.theme-icon--light');
      const iconDark  = btn.querySelector('.theme-icon--dark');
      const label     = btn.querySelector('.theme-label');

      if (theme === this.LIGHT) {
        iconLight?.classList.add('hidden');
        iconDark?.classList.remove('hidden');
        if (label) label.textContent = 'Dark';
        btn.setAttribute('aria-label', 'Switch to dark mode');
        btn.setAttribute('title', 'Switch to dark mode');
      } else {
        iconLight?.classList.remove('hidden');
        iconDark?.classList.add('hidden');
        if (label) label.textContent = 'Light';
        btn.setAttribute('aria-label', 'Switch to light mode');
        btn.setAttribute('title', 'Switch to light mode');
      }
    });
  }

  /* ── Dispatch Custom Event ─────────────────────────────── */
  dispatchEvent(theme) {
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  /* ── Bind Toggle Buttons ───────────────────────────────── */
  bindButtons() {
    this.toggleBtns = document.querySelectorAll('[data-theme-toggle]');
    this.toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  }

  /* ── Watch OS Preference ───────────────────────────────── */
  watchSystemPreference() {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', (e) => {
      // Only follow system if user hasn't set a preference
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.apply(e.matches ? this.LIGHT : this.DARK, true);
      }
    });
  }

  /* ── Init ──────────────────────────────────────────────── */
  init() {
    // Apply theme before paint to prevent FOUC
    const preferred = this.getPreferred();
    this.apply(preferred, false);

    document.addEventListener('DOMContentLoaded', () => {
      this.bindButtons();
      this.updateToggleIcons(this.current);
    });

    this.watchSystemPreference();
  }
}

/* ── Singleton export ─────────────────────────────────────── */
window.themeManager = new ThemeManager();
