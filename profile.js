// ═══════════════════════════════════════════════════════════
//  profile.js  —  DB version
// ═══════════════════════════════════════════════════════════

// ── INIT ──────────────────────────────────────────────────────
async function init() {
    const res = await Profile.get();
    if (!res || !res.success) return;

    const p = res.profile;

    setDisplay('fullname', p.fullname || '');
    setDisplay('username', p.username || '');
    setDisplay('email',    p.email    || '');
    setDisplay('bio',      p.bio      || '');

    // Avatar
    if (p.avatar) {
        document.getElementById('profileAvatar').src = p.avatar;
        const sb = document.getElementById('sidebarAvatar');
        if (sb) sb.src = p.avatar;
    }

    updateAvatarLabels(p);

    // Dark mode toggle state
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) toggle.checked = !!p.darkMode;

    // Apply dark mode if saved in DB
    if (p.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    // Also sync to localStorage so theme.js works on page load for other pages
    const localProfile = JSON.parse(localStorage.getItem('studyplanner_profile') || '{}');
    localProfile.darkMode = !!p.darkMode;
    localStorage.setItem('studyplanner_profile', JSON.stringify(localProfile));
}

// ── DISPLAY HELPERS ────────────────────────────────────────────
function setDisplay(field, value) {
    const display = document.getElementById('display-' + field);
    const isPw    = field.includes('pw');
    if (isPw) { display.textContent = '••••••••'; return; }

    if (value) {
        display.textContent = value;
        display.classList.remove('placeholder-text');
    } else {
        const placeholders = {
            fullname: 'Click to set your full name',
            username: 'Click to set username',
            email:    'Click to set email',
            bio:      'Click to add a short bio…'
        };
        display.textContent = placeholders[field] || 'Click to edit';
        display.classList.add('placeholder-text');
    }
}

function updateAvatarLabels(p) {
    document.getElementById('avatarName').textContent     = p.fullname || p.username || 'Your Name';
    document.getElementById('avatarUsername').textContent = p.username ? '@' + p.username : '@username';
}

// ── INLINE EDITING ─────────────────────────────────────────────
function startEdit(field) {
    const display = document.getElementById('display-' + field);
    const input   = document.getElementById('input-'   + field);
    const wrap    = document.getElementById('wrap-'    + field);
    const isPw    = field.includes('pw');

    if (!isPw) {
        // Pre-fill with current server value
        Profile.get().then(res => {
            if (res && res.success) input.value = res.profile[field] || '';
        });
    } else {
        input.value = '';
    }

    display.style.display = 'none';
    input.style.display   = 'block';
    wrap.classList.add('editing');
    input.focus();
    if (!isPw && input.tagName !== 'TEXTAREA') input.select();
}

async function finishEdit(field) {
    const display = document.getElementById('display-' + field);
    const input   = document.getElementById('input-'   + field);
    const wrap    = document.getElementById('wrap-'    + field);
    const val     = input.value.trim();
    const isPw    = field.includes('pw');

    input.style.display   = 'none';
    display.style.display = '';
    wrap.classList.remove('editing');

    if (!isPw) {
        // Save to DB immediately on blur
        const update = {};
        update[field] = val;
        await Profile.update(update);

        setDisplay(field, val);

        // Update avatar labels if name/username changed
        if (field === 'fullname' || field === 'username') {
            const res = await Profile.get();
            if (res && res.success) updateAvatarLabels(res.profile);
        }
    } else {
        display.textContent = '••••••••';
    }
}

function handleFieldKey(e, field) {
    if (e.key === 'Enter' && field !== 'bio') { e.preventDefault(); finishEdit(field); }
    if (e.key === 'Escape') finishEdit(field);
}

// ── AVATAR ─────────────────────────────────────────────────────
function handleAvatarChange(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { showToast('Image must be under 3MB.', 'error'); return; }

    const reader = new FileReader();
    reader.onload = async e => {
        const src = e.target.result;
        document.getElementById('profileAvatar').src = src;
        const sb = document.getElementById('sidebarAvatar');
        if (sb) sb.src = src;

        await Profile.update({ avatar: src });
        showToast('Profile photo updated!', 'success');
    };
    reader.readAsDataURL(file);
}

// ── DARK MODE TOGGLE ───────────────────────────────────────────
async function handleDarkModeToggle(checkbox) {
    const dark = checkbox.checked;

    // Save to DB
    await Profile.update({ darkMode: dark });

    // Apply immediately
    if (dark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    // Also sync localStorage so theme.js works on other pages
    const localProfile = JSON.parse(localStorage.getItem('studyplanner_profile') || '{}');
    localProfile.darkMode = dark;
    localStorage.setItem('studyplanner_profile', JSON.stringify(localProfile));

    showToast(dark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info');
}

// ── SAVE ALL ───────────────────────────────────────────────────
async function saveAllFields() {
    const newPw     = document.getElementById('input-newpw').value.trim();
    const confirmPw = document.getElementById('input-confirmpw').value.trim();
    const currentPw = document.getElementById('input-currentpw').value.trim();

    // Collect any open text fields
    const update = {};
    ['fullname','username','email','bio'].forEach(field => {
        const input = document.getElementById('input-' + field);
        if (input.style.display !== 'none') update[field] = input.value.trim();
    });

    // Password change
    if (newPw || confirmPw) {
        if (!currentPw) { showToast('Please enter your current password.', 'error'); return; }
        if (newPw !== confirmPw) { showToast('New passwords do not match.', 'error'); return; }
        if (newPw.length < 6)   { showToast('Password must be at least 6 characters.', 'error'); return; }
        update.currentPassword = currentPw;
        update.newPassword     = newPw;
    }

    if (!Object.keys(update).length) { showToast('Nothing to save.', 'info'); return; }

    const res = await Profile.update(update);
    if (!res || !res.success) {
        showToast(res?.error || 'Save failed.', 'error');
        return;
    }

    // Clear password inputs
    ['currentpw','newpw','confirmpw'].forEach(f => {
        document.getElementById('input-' + f).value = '';
    });

    showToast('Profile saved successfully!', 'success');
    init();   // refresh displayed values from server
}

// ── DELETE ACCOUNT ─────────────────────────────────────────────
async function deleteAccount() {
    if (!confirm('DELETE your account? This removes ALL your data. This cannot be undone.')) return;
    if (!confirm('Are you absolutely sure?')) return;

    const res = await Profile.deleteAccount();
    if (res && res.success) {
        Session.clear();
        localStorage.clear();
        showToast('Account deleted. Redirecting…', 'info');
        setTimeout(() => { location.href = 'landing.html'; }, 1500);
    } else {
        showToast('Could not delete account.', 'error');
    }
}

// ── TOAST ──────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className   = 'toast toast-' + type;
    toast.style.display  = 'block';
    toast.style.opacity  = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; toast.style.transition = 'all 0.3s'; }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => { toast.style.display = 'none'; }, 400);
    }, 3000);
}

// ── START ──────────────────────────────────────────────────────
init();