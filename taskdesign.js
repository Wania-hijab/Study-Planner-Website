const hoverSound   = new Audio('hover.mpeg');   
hoverSound.volume   = 0.15;
const successSound = new Audio('complete.mpeg'); 
successSound.volume = 1;
let lastHoverTime  = 0;

function playHoverSound() {
    const now = Date.now();
    if (now - lastHoverTime > 200) {
        hoverSound.currentTime = 0;
        hoverSound.play().catch(() => {});
        lastHoverTime = now;
    }
}

function openModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
    document.getElementById('taskTitle').focus();
}
function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    ['taskTitle', 'taskSubject', 'taskDate'].forEach(id => {
        document.getElementById(id).value = '';
    });

    //reset editing state
    editingId = null;
}
document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});


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
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}


let taskCache = [];

// track editing task
let editingId = null;


async function loadTasks() {
    const res = await Tasks.getAll();
    if (!res || !res.success) return;
    taskCache = res.tasks;
    renderTable();
}

// ADD / UPDATE TASK
async function addTask() {
    const title   = document.getElementById('taskTitle').value.trim();
    const subject = document.getElementById('taskSubject').value.trim();
    const date    = document.getElementById('taskDate').value;

    if (!title || !subject || !date) { alert('Please fill in all fields.'); return; }

    // UPDATE MODE
    if (editingId !== null) {
        const task = taskCache.find(t => t.id === editingId);
        if (!task) return;

        task.title = title;
        task.subject = subject;
        task.date = date;

        await Tasks.update(editingId, { title, subject, date });

        editingId = null;
        closeModal();
        renderTable();
        return;
    }

    // ADD MODE 
    const res = await Tasks.create({ title, subject, date });
    if (!res || !res.success) { alert('Could not add task.'); return; }

    taskCache.unshift(res.task);
    closeModal();
    renderTable();
}

// EDIT TASK
function editTask(id) {
    const task = taskCache.find(t => t.id === id);
    if (!task) return;

    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskSubject').value = task.subject;
    document.getElementById('taskDate').value = task.date;

    editingId = id;
    openModal();
}

// COMPLETE/UNCOMPLETE TASK
async function completeTask(id) {
    const task      = taskCache.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    task.status      = newStatus;
    task.completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
    renderTable();

    if (newStatus === 'completed') {
        successSound.currentTime = 0;
        successSound.play().catch(() => {});
    }

    await Tasks.update(id, { status: newStatus });
}

// DELETE TASK
async function deleteTask(id) {
    taskCache = taskCache.filter(t => t.id !== id);
    renderTable();
    await Tasks.delete(id);
}

// RENDER TABLE
function renderTable() {
    const search    = document.getElementById('searchInput').value.toLowerCase();
    const filterVal = document.getElementById('filterSelect').value;
    const tbody     = document.getElementById('taskTableBody');
    const emptyMsg  = document.getElementById('emptyMsg');

    const total     = taskCache.length;
    const completed = taskCache.filter(t => t.status === 'completed').length;
    const pending   = taskCache.filter(t => t.status === 'pending' && !isOverdue(t.date)).length;

    document.getElementById('totalCount').textContent     = total;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('pendingCount').textContent   = pending;

    let filtered = taskCache.filter(t => {
        const eff         = getEffectiveStatus(t);
        const matchSearch = t.title.toLowerCase().includes(search) || t.subject.toLowerCase().includes(search);
        const matchFilter = filterVal === 'all' || eff === filterVal;
        return matchSearch && matchFilter;
    });

    tbody.innerHTML = '';

    if (!filtered.length) {
        emptyMsg.style.display = 'block';
        return;
    }
    emptyMsg.style.display = 'none';

    filtered.forEach(task => {
        const eff         = getEffectiveStatus(task);
        const statusLabel = eff.charAt(0).toUpperCase() + eff.slice(1);
        const tr          = document.createElement('tr');
        tr.innerHTML = `
            <td>${task.title}</td>
            <td>${task.subject}</td>
            <td>${formatDate(task.date)}</td>
            <td><span class="status status-${eff}">${statusLabel}</span></td>
            <td class="actions">
                <button class="complete" title="${task.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}"
                    onclick="completeTask(${task.id})">
                    <i class="fa-solid ${task.status === 'completed' ? 'fa-rotate-left' : 'fa-check'}"></i>
                </button>
                <button class="delete" title="Delete Task" onclick="deleteTask(${task.id})">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <button class="edit" title="Edit Task" onclick="editTask(${task.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
            </td>`;
        tbody.appendChild(tr);
    });
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

// INIT
loadTasks();
window.addEventListener('focus', loadTasks);