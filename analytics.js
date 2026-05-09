
const PALETTE = [
    '#4a6cf7','#2ecc71','#f39c12','#e74c3c','#8e44ad',
    '#1abc9c','#e67e22','#3498db','#e91e63','#ff9800',
    '#00bcd4','#9c27b0','#4caf50','#f44336','#2196f3'
];

// ── MAIN INIT ──────────────────────────────────────────────────
async function init() {
    // One single API call fetches everything
    const res = await Analytics.getAll();
    if (!res || !res.success) return;

    updateSummary(res.summary);
    drawPie(res.pie);
    drawWeekly(res.weekly);
}

async function handleLogout() {
    document.getElementById('logoutModal').style.display = 'flex';
}
async function confirmLogout() {
    document.getElementById('logoutModal').style.display = 'none';
    await Auth.logout();
    Session.clear();
    location.href = 'login.html';
}
function cancelLogout() {
    document.getElementById('logoutModal').style.display = 'none';
}


// ── SUMMARY CARDS ──────────────────────────────────────────────
function updateSummary(s) {
    document.getElementById('sumTotal').textContent     = s.total;
    document.getElementById('sumCompleted').textContent = s.completed;
    document.getElementById('sumPending').textContent   = s.pending;
    document.getElementById('sumMissed').textContent    = s.missed;
    document.getElementById('sumNotes').textContent     = s.notes;
}

// ── PIE CHART ──────────────────────────────────────────────────
function drawPie(entries) {
    if (!entries || !entries.length) {
        document.getElementById('noTasksMsg').style.display  = 'block';
        document.getElementById('pieWrapper').style.display  = 'none';
        return;
    }

    const total = entries.reduce((sum, e) => sum + e.count, 0);
    document.getElementById('pieCenterNum').textContent = entries.length;

    const canvas = document.getElementById('pieCanvas');
    const ctx    = canvas.getContext('2d');
    const cx = 110, cy = 110, r = 100, holeR = 62;

    ctx.clearRect(0, 0, 220, 220);

    let startAngle = -Math.PI / 2;
    entries.forEach((entry, i) => {
        const slice = (entry.count / total) * 2 * Math.PI;
        const color = PALETTE[i % PALETTE.length];

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        entry.color      = color;
        entry.startAngle = startAngle;
        entry.slice      = slice;
        startAngle += slice;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, holeR, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Legend
    const legend = document.getElementById('legendCard');
    legend.innerHTML = entries.map(entry => {
        const pct = Math.round((entry.count / total) * 100);
        return `
            <div class="legend-item">
                <span class="dot" style="background:${entry.color};"></span>
                <div>
                    <h4>${entry.label}</h4>
                    <p>${entry.count} task${entry.count !== 1 ? 's' : ''} &bull; ${pct}% workload</p>
                </div>
            </div>`;
    }).join('');

    // Hover tooltip
    canvas.onmousemove = function(e) {
        const rect = canvas.getBoundingClientRect();
        const mx   = e.clientX - rect.left - cx;
        const my   = e.clientY - rect.top  - cy;
        const dist = Math.sqrt(mx * mx + my * my);
        if (dist > holeR && dist < r) {
            let angle = Math.atan2(my, mx) - (-Math.PI / 2);
            if (angle < 0) angle += 2 * Math.PI;
            const hovered = entries.find(en => {
                let s = en.startAngle + Math.PI / 2;
                if (s < 0) s += 2 * Math.PI;
                return angle >= s && angle < s + en.slice;
            });
            canvas.title = hovered
                ? `${hovered.label}: ${hovered.count} task${hovered.count !== 1 ? 's' : ''}`
                : '';
        } else { canvas.title = ''; }
    };
}

// ── WEEKLY PROGRESS ────────────────────────────────────────────
function drawWeekly(counts) {
    const grid  = document.getElementById('weeklyGrid');
    const noMsg = document.getElementById('noActivityMsg');

    if (!counts || !counts.some(c => c.total > 0)) {
        grid.style.display  = 'none';
        noMsg.style.display = 'block';
        return;
    }

    grid.style.display  = 'grid';
    noMsg.style.display = 'none';

    const maxVal   = Math.max(...counts.map(c => c.total), 1);
    const todayKey = new Date().toISOString().slice(0, 10);

    grid.innerHTML = counts.map(c => {
        const heightPct = Math.round((c.total / maxVal) * 100);
        const isToday   = c.date === todayKey;
        const label     = c.total > 0
            ? `${c.tasks} task${c.tasks !== 1 ? 's' : ''} completed${c.notes > 0 ? ` + ${c.notes} note${c.notes !== 1 ? 's' : ''}` : ''}`
            : 'No activity';

        return `
            <div class="progress-card ${isToday ? 'today-col' : ''}">
                <h4>${c.label}${isToday ? ' <span class="today-dot"></span>' : ''}</h4>
                <div class="track">
                    <div class="fill" style="--h:${heightPct}%" title="${label}"></div>
                </div>
                <small class="bar-count">${c.total > 0 ? c.total : '–'}</small>
            </div>`;
    }).join('');

    // Animate bars
    requestAnimationFrame(() => {
        document.querySelectorAll('.fill').forEach(bar => {
            bar.style.height = '0';
            setTimeout(() => {
                bar.style.transition = 'height 0.9s cubic-bezier(0.34,1.56,0.64,1)';
                bar.style.height = getComputedStyle(bar).getPropertyValue('--h');
            }, 80);
        });
    });
}

// Extra styles for bar elements 
const extraStyle = document.createElement('style');
extraStyle.textContent = `
    .bar-count { display:block;text-align:center;margin-top:8px;font-size:13px;font-weight:700;color:#4a6cf7; }
    .today-col h4 { color:#4a6cf7;font-weight:800; }
    .today-dot { display:inline-block;width:7px;height:7px;background:#4a6cf7;border-radius:50%;margin-left:3px;vertical-align:middle; }
    .today-col .fill { background:linear-gradient(to top,#4a6cf7,#8ea0ff) !important; }
    @media (max-width:700px) { .progress-grid { grid-template-columns:repeat(4,1fr); } }
`;
document.head.appendChild(extraStyle);

// ── START ──────────────────
init();
window.addEventListener('focus', init);