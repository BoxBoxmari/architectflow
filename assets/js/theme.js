/**
 * Theme Manager — light, dark, system modes with persistence.
 * Ported from src/context/ThemeContext.tsx
 */

const ThemeManager = (() => {
  'use strict';

  const STORAGE_KEY = 'architectflow-theme';
  let _mode = 'light';
  let _systemDark = false;
  let _mediaQuery = null;
  let _onChangeCallbacks = [];

  function getResolvedTheme() {
    return _mode === 'system' ? (_systemDark ? 'dark' : 'light') : _mode;
  }

  function applyTheme() {
    const resolved = getResolvedTheme();
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    _onChangeCallbacks.forEach(cb => cb(_mode, resolved));
  }

  function setThemeMode(mode) {
    if (!['light', 'dark', 'system'].includes(mode)) return;
    _mode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (_) {
      // Private browsing or storage quota — silently ignore
    }
    applyTheme();
    updateToggleUI();
  }

  function getThemeMode() {
    return _mode;
  }

  function onChange(cb) {
    _onChangeCallbacks.push(cb);
  }

  function updateToggleUI() {
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      const btnMode = btn.getAttribute('data-theme-btn');
      if (btnMode === _mode) {
        btn.classList.add('theme-btn-active');
      } else {
        btn.classList.remove('theme-btn-active');
      }
    });
  }

  function initTheme() {
    // Load saved preference
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        _mode = saved;
      }
    } catch (_) {
      // localStorage unavailable — use default
    }

    // Detect system preference
    _mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    _systemDark = _mediaQuery.matches;
    _mediaQuery.addEventListener('change', e => {
      _systemDark = e.matches;
      if (_mode === 'system') applyTheme();
    });

    applyTheme();

    // Bind toggle buttons
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        setThemeMode(btn.getAttribute('data-theme-btn'));
      });
    });
    updateToggleUI();
  }

  return { initTheme, setThemeMode, getThemeMode, onChange };
})();

// Expose on window — same reason as AppShell: `const` does not attach to window.
window.ThemeManager = ThemeManager;
