/**
 * App Shell — sidebar collapse, mobile sidebar, active nav state.
 */

const AppShell = (() => {
  'use strict';

  let _collapsed = false;
  let _mobileOpen = false;

  function init() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileCloseBtn = document.getElementById('sidebar-close');
    const sidebarWrapper = document.getElementById('sidebar-wrapper');

    // Active nav state
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('[data-nav-route]').forEach(item => {
      const route = item.getAttribute('data-nav-route');
      // Use endsWith instead of strict prefix to support arbitrary sub-path deployments
      if (currentPath === route || currentPath.endsWith(route)) {
        item.classList.add('active');
      }
    });

    // Sidebar collapse toggle (desktop)
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        _collapsed = !_collapsed;
        if (sidebarWrapper) {
          sidebarWrapper.classList.toggle('sidebar-collapsed', _collapsed);
        }
        updateCollapseIcon();
      });
    }

    // Mobile menu open
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        _mobileOpen = true;
        updateMobileState();
      });
    }

    // Mobile sidebar close
    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', () => {
        _mobileOpen = false;
        updateMobileState();
      });
    }

    // Overlay click to close
    if (overlay) {
      overlay.addEventListener('click', () => {
        _mobileOpen = false;
        updateMobileState();
      });
    }
  }

  function updateMobileState() {
    const sidebarWrapper = document.getElementById('sidebar-wrapper');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebarWrapper) {
      sidebarWrapper.classList.toggle('sidebar-mobile-open', _mobileOpen);
    }
    if (overlay) {
      overlay.classList.toggle('visible', _mobileOpen);
    }
  }

  function updateCollapseIcon() {
    const icon = document.querySelector('#sidebar-toggle svg use, #sidebar-toggle .collapse-icon');
    const labels = document.querySelectorAll('.sidebar-label');
    const navLabel = document.querySelector('.sidebar-nav-label');
    const footerText = document.querySelector('.sidebar-footer-text');
    const footerBadge = document.querySelector('.sidebar-footer-badge');
    const activeDots = document.querySelectorAll('.sidebar-active-dot');
    const logoText = document.querySelector('.sidebar-logo-text');

    labels.forEach(l => l.style.display = _collapsed ? 'none' : '');
    if (navLabel) navLabel.style.display = _collapsed ? 'none' : '';
    if (footerText) footerText.style.display = _collapsed ? 'none' : '';
    if (footerBadge) footerBadge.style.display = _collapsed ? 'flex' : 'none';
    if (logoText) logoText.style.display = _collapsed ? 'none' : '';
    activeDots.forEach(d => d.style.display = _collapsed ? 'none' : '');
  }

  return { init };
})();
