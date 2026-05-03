// ═══════════════════════════════════════════════════════════
//  dashboard.js  —  DB version
// ═══════════════════════════════════════════════════════════

// 🔊 Timer sound
const startSound = new Audio('sound.mpeg');
startSound.volume = 0.7;

// ── STATUS HELPERS ────────────────────────────────────────────
function isOverdue(dateStr) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(dateStr) < today;
}
function getEffectiveStatus(task) {
    if (task.status === 'completed') return 'completed';
    if (isOverdue(task.date))        return 'missed';
    return 'pending';
}
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── DASHBOARD STATS ───────────────────────────────────────────
let allTasks = [];

async function init() {
    const res = await Tasks.getAll();
    if (!res || !res.success) return;
    allTasks = res.tasks;
    updateStats();
    renderRecentTasks(allTasks);
    initCalendar();
}

function updateStats() {
    const total     = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    const pending   = allTasks.filter(t => t.status !== 'completed').length;
    const subjects  = [...new Set(allTasks.map(t => t.subject.toLowerCase()))].length;
    const pct       = total ? Math.round((completed / total) * 100) : 0;

    document.getElementById('totalCount').textContent     = total;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('pendingCount').textContent   = pending;
    document.getElementById('subjectCount').textContent   = subjects;
    document.getElementById('progressLabel').textContent  = pct + '% Completion';
    document.getElementById('progressFill').style.width   = pct + '%';
}

// ── RECENT TASKS ──────────────────────────────────────────────
function renderRecentTasks(tasks) {
    const container = document.getElementById('recentTasksList');
    if (!tasks.length) {
        container.innerHTML = `<p style="color:#aaa;font-size:14px;text-align:center;padding:20px 0;">
            No tasks yet. <a href="taskdesign.html" style="color:#4a6cf7;">Add some →</a></p>`;
        return;
    }
    const recent = [...tasks].reverse().slice(0, 5);
    container.innerHTML = recent.map(task => {
        const eff = getEffectiveStatus(task);
        return `
            <div class="task-row">
                <div>
                    <span>${task.title}</span><br>
                    <small>${task.subject} &bull; Due ${formatDate(task.date)}</small>
                </div>
                <span class="badge badge-${eff}">${eff.charAt(0).toUpperCase() + eff.slice(1)}</span>
            </div>`;
    }).join('');
}

function filterRecentTasks() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    renderRecentTasks(allTasks.filter(t =>
        t.title.toLowerCase().includes(term) || t.subject.toLowerCase().includes(term)
    ));
}

// ── CALENDAR ──────────────────────────────────────────────────
let calYear, calMonth;

function initCalendar() {
    const now = new Date();
    calYear   = now.getFullYear();
    calMonth  = now.getMonth();
    renderCalendar();
}

function changeMonth(dir) {
    calMonth += dir;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    if (calMonth < 0)  { calMonth = 11; calYear--; }
    renderCalendar();
}

function renderCalendar() {
    const today     = new Date(); today.setHours(0, 0, 0, 0);
    const title     = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDay  = new Date(calYear, calMonth, 1).getDay();
    const daysInMon = new Date(calYear, calMonth + 1, 0).getDate();

    document.getElementById('calendarTitle').textContent = title;

    // Build day→status map from task cache
    const dayMap = {};
    allTasks.forEach(task => {
        const d = new Date(task.date);
        if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
            const day = d.getDate();
            if (!dayMap[day]) dayMap[day] = [];
            dayMap[day].push({ status: getEffectiveStatus(task), title: task.title });
        }
    });

    const grid = document.getElementById('calendarDates');
    grid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('span');
        empty.className = 'cal-day empty';
        grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMon; d++) {
        const cell    = document.createElement('span');
        const thisDay = new Date(calYear, calMonth, d); thisDay.setHours(0, 0, 0, 0);
        const isToday = thisDay.getTime() === today.getTime();
        let   statusClass = '';

        if (dayMap[d]) {
            const statuses = dayMap[d].map(t => t.status);
            if (statuses.includes('missed'))    statusClass = ' has-missed';
            else if (statuses.includes('pending'))   statusClass = ' has-pending';
            else if (statuses.includes('completed')) statusClass = ' has-completed';
        }

        cell.className = 'cal-day' + statusClass + (isToday ? ' today' : '');
        const numSpan  = document.createElement('span');
        numSpan.textContent = d;
        cell.appendChild(numSpan);

        if (dayMap[d]) {
            const tip = document.createElement('div');
            tip.className = 'cal-tooltip';
            tip.innerHTML = dayMap[d].map(t => `${t.title} (${t.status})`).join('<br>');
            cell.appendChild(tip);
        }

        grid.appendChild(cell);
    }
}

// ── FOCUS TIMER ───────────────────────────────────────────────
let timerId   = null;
let timeLeft  = 25 * 60;
let isRunning = false;

function getDuration() {
    return parseInt(document.getElementById('timerDuration').value) * 60;
}
function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('timerDisplay').textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
}
function setTimerBtn(running) {
    document.getElementById('startPauseBtn').innerHTML = running
        ? '<i class="fa-solid fa-pause"></i> Pause'
        : '<i class="fa-solid fa-play"></i> Resume';
}
function toggleTimer() {
    if (isRunning) {
        clearInterval(timerId); timerId = null; isRunning = false;
        setTimerBtn(false);
        document.getElementById('timerStatus').textContent = 'Paused';
    } else {
        if (timeLeft <= 0) restartTimer();
        startSound.currentTime = 0;
        startSound.play().catch(() => {});
        isRunning = true;
        document.getElementById('startPauseBtn').innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
        document.getElementById('timerStatus').textContent = 'Focusing…';
        timerId = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerId); timerId = null; isRunning = false;
                document.getElementById('startPauseBtn').innerHTML = '<i class="fa-solid fa-play"></i> Start';
                document.getElementById('timerStatus').textContent = '✅ Session complete! Take a break.';
            }
        }, 1000);
    }
}
function stopTimer() {
    startSound.currentTime = 0; startSound.play().catch(() => {});
    clearInterval(timerId); timerId = null; isRunning = false;
    timeLeft = getDuration(); updateTimerDisplay();
    document.getElementById('startPauseBtn').innerHTML = '<i class="fa-solid fa-play"></i> Start';
    document.getElementById('timerStatus').textContent = 'Stopped';
}
function restartTimer() {
    clearInterval(timerId); timerId = null; isRunning = false;
    timeLeft = getDuration(); updateTimerDisplay();
    document.getElementById('startPauseBtn').innerHTML = '<i class="fa-solid fa-play"></i> Start';
    document.getElementById('timerStatus').textContent = 'Ready to focus';
    toggleTimer();
}
document.getElementById('timerDuration').addEventListener('change', () => {
    if (!isRunning) {
        timeLeft = getDuration(); updateTimerDisplay();
        document.getElementById('timerStatus').textContent = 'Ready to focus';
    }
});

// ── INIT ──────────────────────────────────────────────────────
init();
window.addEventListener('focus', init);

window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('showWelcome') === '1') {
        const user = Session.get();
        showWelcomePopup(user?.fullname || user?.username || 'Student');
        sessionStorage.removeItem('showWelcome');
    }
});