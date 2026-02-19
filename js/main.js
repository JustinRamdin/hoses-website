/* SGL Hose n' Cable Solutions - small vanilla JS helpers */

(function () {
  const menuBtn = document.querySelector('[data-menu-btn]');
  const navLinks = document.querySelector('[data-nav-links]');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Set current year in footer
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Highlight active page in nav
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('a[data-nav]').forEach((a) => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path) a.setAttribute('aria-current', 'page');
  });
})();
