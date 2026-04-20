/**
 * Lightweight toast notification — replaces sonner.
 */

const Toast = (() => {
  'use strict';

  let _container = null;

  function ensureContainer() {
    if (_container) return _container;
    _container = document.createElement('div');
    _container.className = 'toast-container';
    document.body.appendChild(_container);
    return _container;
  }

  /**
   * @param {'success'|'error'|'info'} type
   * @param {string} message
   * @param {Object} [options]
   * @param {string} [options.description]
   * @param {number} [options.duration=3500]
   */
  function showToast(type, message, options) {
    const opts = Object.assign({ description: '', duration: 3500 }, options);
    const container = ensureContainer();

    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML =
      '<div class="toast-icon">' + (type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ') + '</div>' +
      '<div class="toast-body">' +
        '<div class="toast-message">' + message + '</div>' +
        (opts.description ? '<div class="toast-description">' + opts.description + '</div>' : '') +
      '</div>';

    container.appendChild(el);

    // Trigger animation
    requestAnimationFrame(() => el.classList.add('toast-visible'));

    setTimeout(() => {
      el.classList.remove('toast-visible');
      el.classList.add('toast-exit');
      el.addEventListener('transitionend', () => el.remove());
      // Fallback removal
      setTimeout(() => { if (el.parentNode) el.remove(); }, 500);
    }, opts.duration);
  }

  return { showToast };
})();
