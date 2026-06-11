/**
 * Survexa Mobile UI Prototype — Navigation & Theme
 */

const SCREENS = [
  { id: 'splash', label: '1. Splash' },
  { id: 'welcome', label: '2. Welcome' },
  { id: 'login', label: '3. Login' },
  { id: 'signup', label: '4. Signup' },
  { id: 'otp', label: '5. OTP Verification' },
  { id: 'forgot', label: '6. Forgot Password' },
  { id: 'dashboard', label: '7. Dashboard' },
  { id: 'create-survey', label: '8. Create Survey' },
  { id: 'ai-generator', label: '9. AI Question Generator' },
  { id: 'builder', label: '10. Survey Builder' },
  { id: 'preview', label: '11. Survey Preview' },
  { id: 'sharing', label: '12. Survey Sharing' },
  { id: 'qr', label: '13. QR Code' },
  { id: 'responses', label: '14. Response Collection' },
  { id: 'analytics', label: '15. Analytics Dashboard' },
  { id: 'bar-chart', label: '16. Bar Chart' },
  { id: 'pie-chart', label: '17. Pie Chart' },
  { id: 'line-chart', label: '18. Line Chart' },
  { id: 'ai-insights', label: '19. AI Insights' },
  { id: 'recommendations', label: '20. Recommendations' },
  { id: 'pdf-preview', label: '21. PDF Preview' },
  { id: 'download', label: '22. Report Download' },
  { id: 'email', label: '23. Report Email' },
  { id: 'notifications', label: '24. Notifications' },
  { id: 'profile', label: '25. User Profile' },
  { id: 'settings', label: '26. Settings' },
  { id: 'dark-settings', label: '27. Dark Mode Settings' },
  { id: 'admin', label: '28. Admin Dashboard' },
];

function initNav() {
  const nav = document.getElementById('screen-nav');
  nav.innerHTML = SCREENS.map(
    (s) => `<li><button type="button" data-screen="${s.id}">${s.label}</button></li>`
  ).join('');

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-screen]');
    if (!btn) return;
    showScreen(btn.dataset.screen);
  });
}

function showScreen(id) {
  document.querySelectorAll('.screen-panel').forEach((el) => {
    el.classList.toggle('active', el.id === `screen-${id}`);
  });
  document.querySelectorAll('#screen-nav button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.screen === id);
  });
}

function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('survexa-theme') || 'light';
  root.setAttribute('data-theme', saved);
  updateThemeButtons(saved);

  document.querySelectorAll('[data-set-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.setTheme;
      root.setAttribute('data-theme', theme);
      localStorage.setItem('survexa-theme', theme);
      updateThemeButtons(theme);
    });
  });
}

function updateThemeButtons(theme) {
  document.querySelectorAll('[data-set-theme]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.setTheme === theme);
  });
}

function initToggles() {
  document.querySelectorAll('.toggle').forEach((t) => {
    t.addEventListener('click', () => t.classList.toggle('on'));
  });
}

function animateBars() {
  document.querySelectorAll('.bar[data-height]').forEach((bar) => {
    const h = bar.dataset.height;
    requestAnimationFrame(() => {
      bar.style.height = h + '%';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTheme();
  initToggles();
  showScreen('splash');
  animateBars();

  setTimeout(() => {
    const splashBtn = document.querySelector('[data-auto-welcome]');
    if (splashBtn) splashBtn.addEventListener('click', () => showScreen('welcome'));
  }, 0);
});

export { showScreen };
