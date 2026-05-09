/* ═══════════════════════════════════════════════
   STUDYPLANNER — SHARED THEME & UI SCRIPT
   Include this in every page via <script src="theme.js"></script>
   ═══════════════════════════════════════════════ */

const PROFILE_KEY = 'studyplanner_profile';
const AUTH_KEY    = 'studyplanner_auth';

// ── DARK MODE ─────────────────────────────────────────────────
function applyTheme() {
  const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
  if (p.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

// Run immediately so there's no flash
applyTheme();

// Keep toggle in sync if on profile page
window.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    toggle.checked = !!p.darkMode;
  }
});

// Called by profile page toggle
function handleDarkModeToggle(checkbox) {
  const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
  p.darkMode = checkbox.checked;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  applyTheme();
  if (typeof showToast === 'function') {
    showToast(checkbox.checked ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info');
  }
}

// ── CLOSE BUTTON (X → landing.html) ──────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Inject close button into every inner page that has a .main element
  const main = document.querySelector('.main');
  if (!main) return;

  const closeBtn = document.createElement('button');
  closeBtn.id        = 'globalCloseBtn';
  closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  closeBtn.title     = 'Exit to Home';
  closeBtn.onclick   = () => { location.href = 'landing.html'; };

  // Styles injected directly so no extra CSS file needed
  Object.assign(closeBtn.style, {
    position:   'fixed',
    top:        '18px',
    right:      '22px',
    zIndex:     '9999',
    width:      '38px',
    height:     '38px',
    borderRadius: '50%',
    border:     'none',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(8px)',
    boxShadow:  '0 4px 14px rgba(0,0,0,0.12)',
    cursor:     'pointer',
    fontSize:   '16px',
    color:      '#e74c3c',
    display:    'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.2s',
  });

  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background  = '#e74c3c';
    closeBtn.style.color       = 'white';
    closeBtn.style.transform   = 'scale(1.1)';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background  = 'rgba(255,255,255,0.85)';
    closeBtn.style.color       = '#e74c3c';
    closeBtn.style.transform   = 'scale(1)';
  });

  document.body.appendChild(closeBtn);
});

// ── LOGOUT POPUP ──────────────────────────────────────────────
function injectLogoutModal() {
  if (document.getElementById('logoutModalOverlay')) return;

  const html = `
  <div id="logoutModalOverlay" style="
    display:none; position:fixed; inset:0;
    background:rgba(0,0,0,0.5); backdrop-filter:blur(8px);
    z-index:10000; align-items:center; justify-content:center;">

    <div style="
      background:white; border-radius:28px; padding:52px 48px;
      width:420px; max-width:90vw; text-align:center;
      box-shadow:0 30px 80px rgba(0,0,0,0.25);
      animation: spPopIn 0.35s ease; position:relative;">

      <div style="font-size:52px; margin-bottom:18px;">🔒</div>
      <h3 style="margin:0; font-size:26px; color:#1e3c72; font-family:'Segoe UI',sans-serif;">Confirm Logout</h3>
      <p style="margin:16px 0 30px; font-size:16px; color:#6b7280; font-family:'Segoe UI',sans-serif;">
        Are you sure you want to logout from your account?
      </p>

      <div id="logoutSpinner" style="display:none; margin-bottom:20px;">
        <div style="
          width:36px; height:36px; border:4px solid #eef2ff;
          border-top-color:#4a6cf7; border-radius:50%;
          animation:spSpin 0.7s linear infinite; margin:0 auto 12px;">
        </div>
        <p style="color:#4a6cf7; font-weight:700; font-size:15px; font-family:'Segoe UI',sans-serif;">
          Logging Out…
        </p>
      </div>

      <div id="logoutBtns" style="display:flex; gap:16px; justify-content:center;">
        <button onclick="closeLogoutModal()" style="
          flex:1; padding:13px; border-radius:14px; border:2px solid #eef2ff;
          background:white; font-size:14px; font-weight:600; cursor:pointer;
          font-family:'Segoe UI',sans-serif; color:#555; transition:0.2s;"
          onmouseover="this.style.background='#f0f4ff'"
          onmouseout="this.style.background='white'">
          Cancel
        </button>
        <button onclick="confirmLogout()" style="
          flex:1; padding:13px; border-radius:14px; border:none;
          background:linear-gradient(135deg,#e74c3c,#c0392b);
          color:white; font-size:14px; font-weight:700; cursor:pointer;
          font-family:'Segoe UI',sans-serif;
          box-shadow:0 6px 18px rgba(231,76,60,0.3); transition:0.2s;"
          onmouseover="this.style.transform='translateY(-2px)'"
          onmouseout="this.style.transform='none'">
          Logout
        </button>
      </div>
    </div>
  </div>

  <style>
    @keyframes spPopIn { from{transform:scale(0.85);opacity:0;} to{transform:scale(1);opacity:1;} }
    @keyframes spSpin  { to{transform:rotate(360deg);} }
  </style>`;

  document.body.insertAdjacentHTML('beforeend', html);

  // Click overlay to cancel
  document.getElementById('logoutModalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeLogoutModal();
  });
}

function openLogoutModal() {
  injectLogoutModal();
  const el = document.getElementById('logoutModalOverlay');
  el.style.display = 'flex';
}

function closeLogoutModal() {
  const el = document.getElementById('logoutModalOverlay');
  if (el) el.style.display = 'none';
}

function confirmLogout() {
  document.getElementById('logoutBtns').style.display   = 'none';
  document.getElementById('logoutSpinner').style.display = 'block';
  setTimeout(() => {
    // Clear auth session
    localStorage.removeItem(AUTH_KEY);
    location.href = 'landing.html';
  }, 1800);
}

// Wire up all .logout menu items automatically
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.logout').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', openLogoutModal);
  });
});

// ── WELCOME POPUP (shown once after login) ────────────────────
function showWelcomePopup(username) {
  if (document.getElementById('welcomeOverlay')) return;

  const name = username || 'Student';
  const html = `
  <div id="welcomeOverlay" style="
    position:fixed; inset:0;
    background:rgba(0,0,0,0.5); backdrop-filter:blur(10px);
    z-index:10001; display:flex; align-items:center; justify-content:center;">

    <div style="
      background:white; border-radius:28px; padding:56px 48px;
      width:440px; max-width:90vw; text-align:center;
      box-shadow:0 40px 80px rgba(0,0,0,0.25);
      animation: spPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1);">

      <div style="font-size:56px; margin-bottom:16px;">🎉</div>
      <h2 style="margin:0 0 10px; color:#1e3c72; font-size:26px; font-family:'Segoe UI',sans-serif;">
        Welcome, ${name}!
      </h2>
      <p style="color:#6b7280; font-size:16px; margin:0 0 28px; font-family:'Segoe UI',sans-serif;">
        Welcome to <strong style="color:#4a6cf7;">StudyPlanner</strong> 🚀<br>
        Your smart study journey starts now.
      </p>
      <div style="
        width:100%; height:6px; background:#eef2ff; border-radius:10px; overflow:hidden;">
        <div id="welcomeBar" style="
          width:0%; height:100%;
          background:linear-gradient(90deg,#4a6cf7,#2ecc71);
          border-radius:10px; transition:width 1.8s ease;">
        </div>
      </div>
      <p style="color:#aaa; font-size:12px; margin-top:10px; font-family:'Segoe UI',sans-serif;">
        Loading your dashboard…
      </p>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  requestAnimationFrame(() => {
    setTimeout(() => {
      const bar = document.getElementById('welcomeBar');
      if (bar) bar.style.width = '100%';
    }, 100);
  });

  setTimeout(() => {
    const el = document.getElementById('welcomeOverlay');
    if (el) { el.style.opacity = '0'; el.style.transition = 'opacity 0.4s'; }
    setTimeout(() => { if (el) el.remove(); }, 400);
  }, 2400);
}

// ── AUTH GUARD (call on every inner page) ─────────────────────
function requireAuth() {
  const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
  if (!auth) {
    location.href = 'login.html';
    return false;
  }
  return true;
}

// ── UPDATE SIDEBAR AVATAR FROM PROFILE ────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
  const a = JSON.parse(localStorage.getItem(AUTH_KEY)    || '{}');

  // Set sidebar avatar if profile picture saved
  const imgs = document.querySelectorAll('.sidebar-image img, #sidebarAvatar');
  if (p.avatar) {
    imgs.forEach(img => { img.src = p.avatar; });
  }

  // Sync username shown in sidebar h2 (optional — only if element exists)
  const sidebarName = document.querySelector('.sidebar h2');
  // Keep "StudyPlanner" — don't override
});