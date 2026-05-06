// ═══════════════════════════════════════════════════════════
//  login.js  —  DB version (replaces localStorage auth)
//  Requires api.js to be loaded first
// ═══════════════════════════════════════════════════════════

// If already logged in (session cached), go straight to dashboard
(async () => {
    if (sessionStorage.getItem('sp_logged_out') === '1') {
        sessionStorage.removeItem('sp_logged_out');
        return;
    }
    const user = Session.get();
    if (user) { location.href = 'dashboard.html'; return; }

    const res = await Auth.me();
    if (res && res.success) {
        Session.set(res.user);
        location.href = 'dashboard.html';
    }
})();

function togglePw(id, btn) {
    const inp  = document.getElementById(id);
    const show = inp.type === 'password';
    inp.type   = show ? 'text' : 'password';
    btn.innerHTML = `<i class="fa-solid fa-eye${show ? '-slash' : ''}"></i>`;
}

async function handleLogin() {
    document.querySelectorAll('.err').forEach(e => e.style.display = 'none');

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    let   ok       = true;

    if (!username) { document.getElementById('usernameErr').style.display = 'block'; ok = false; }
    if (!password) { document.getElementById('passwordErr').style.display = 'block'; ok = false; }
    if (!ok) return;

    const btn = document.getElementById('loginBtn');
    document.getElementById('loginBtnText').textContent = 'Signing in…';
    document.getElementById('loginSpinner').style.display = 'block';
    btn.disabled = true;

    const res = await Auth.login({ username, password });

    if (!res || !res.success) {
        document.getElementById('loginBtnText').textContent = 'Sign In';
        document.getElementById('loginSpinner').style.display = 'none';
        btn.disabled = false;
        const e = document.getElementById('loginErr');
        e.textContent  = '❌ ' + (res?.error || 'Incorrect username or password.');
        e.style.display = 'block';
        return;
    }

    // Cache user and apply their dark mode preference immediately
    Session.set(res.user);
    if (res.user.dark_mode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('studyplanner_profile', JSON.stringify({ darkMode: true }));
    }

    sessionStorage.setItem('showWelcome', '1');
    location.href = 'dashboard.html';
}

document.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });