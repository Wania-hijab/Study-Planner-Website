const CARD_COLORS = ['blue','purple','pink','green','blue','purple','pink','green'];
const CARD_ICONS  = {
    math:'fa-calculator', mathematics:'fa-calculator',
    physics:'fa-atom', chemistry:'fa-flask', biology:'fa-dna',
    computer:'fa-code', cs:'fa-code', english:'fa-book',
    history:'fa-landmark', geography:'fa-globe',
    economics:'fa-chart-line', default:'fa-note-sticky'
};

function getIcon(subject) {
    const key = subject.toLowerCase().split(' ')[0];
    return CARD_ICONS[key] || CARD_ICONS.default;
}

// IN-MEMORY CACHE
let noteCache = [];

async function loadNotes() {
    const res = await Notes.getAll();
    if (!res || !res.success) return;
    noteCache = res.notes;
    renderNotes();
}

// RENDER SUBJECT CARDS
function renderNotes() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const grid   = document.getElementById('notesGrid');
    const empty  = document.getElementById('emptyState');

    if (!noteCache.length) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    // Group by subject
    const subjectMap = {};
    noteCache.forEach(note => {
        const key = note.subject.trim().toLowerCase();
        if (!subjectMap[key]) subjectMap[key] = { label: note.subject.trim(), notes: [] };
        subjectMap[key].notes.push(note);
    });

    let entries = Object.values(subjectMap);
    if (search) {
        entries = entries.filter(e =>
            e.label.toLowerCase().includes(search) ||
            e.notes.some(n => n.topic.toLowerCase().includes(search))
        );
    }

    if (!entries.length) {
        grid.innerHTML = `<p style="color:#aaa;text-align:center;grid-column:1/-1;padding:40px;">No notes match your search.</p>`;
        return;
    }

    grid.innerHTML = entries.map((entry, i) => {
        const color   = CARD_COLORS[i % CARD_COLORS.length];
        const icon    = getIcon(entry.label);
        const dates   = entry.notes.map(n => n.lastAccessed || n.createdAt || '').filter(Boolean);
        const latest  = dates.sort().reverse()[0];
        const dateStr = latest ? new Date(latest).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
        const chips   = entry.notes.slice(0, 3).map(n => `<span class="topic-chip">${n.topic}</span>`).join('');
        const more    = entry.notes.length > 3 ? `<span class="topic-chip more">+${entry.notes.length - 3} more</span>` : '';

        return `
            <div class="note-card ${color}" onclick="openTopicsModal('${entry.label.replace(/'/g,"\\'")}')">
                <span class="topic-count-badge">${entry.notes.length} topic${entry.notes.length !== 1 ? 's' : ''}</span>
                <i class="fa-solid ${icon} note-icon"></i>
                <h3>${entry.label}</h3>
                <div class="topics-preview">${chips}${more}</div>
                <span class="note-date"><i class="fa-regular fa-clock" style="margin-right:4px;"></i>${dateStr}</span>
            </div>`;
    }).join('');
}

// NEW NOTE MODAL
let _openSubject = '';

function openNewNoteModal(prefilledSubject) {
    document.getElementById('newSubject').value = prefilledSubject || '';
    document.getElementById('newTopic').value   = '';
    document.getElementById('newNoteModal').style.display = 'flex';
    setTimeout(() => {
        (prefilledSubject
            ? document.getElementById('newTopic')
            : document.getElementById('newSubject')
        ).focus();
    }, 100);
}
function closeNewNoteModal() {
    document.getElementById('newNoteModal').style.display = 'none';
}
document.getElementById('newNoteModal').addEventListener('click', function(e) {
    if (e.target === this) closeNewNoteModal();
});

async function createNote() {
    const subject = document.getElementById('newSubject').value.trim();
    const topic   = document.getElementById('newTopic').value.trim();
    if (!subject || !topic) { alert('Please fill in both fields.'); return; }

    const res = await Notes.create({ subject, topic });
    if (!res || !res.success) { alert('Could not create note.'); return; }

    noteCache.unshift(res.note);
    closeNewNoteModal();
    closeTopicsModal();
    location.href = `note-editor.html?id=${res.note.id}`;
}

// TOPICS MODAL
function openTopicsModal(subject) {
    _openSubject = subject;
    const notes  = noteCache.filter(n => n.subject.trim().toLowerCase() === subject.trim().toLowerCase());

    document.getElementById('topicsSubjectTitle').textContent = subject;
    document.getElementById('topicsSubjectCount').textContent = `${notes.length} topic${notes.length !== 1 ? 's' : ''}`;

    const list = document.getElementById('topicsList');
    list.innerHTML = notes.map(n => {
        const d       = n.lastAccessed || n.createdAt || '';
        const dateStr = d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
        return `
            <div class="topic-row" onclick="openNote(${n.id})">
                <div class="topic-row-left">
                    <h4>${n.topic}</h4>
                    <small>Last accessed: ${dateStr}</small>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <i class="fa-solid fa-arrow-right" style="color:#4a6cf7;font-size:13px;"></i>
                    <button class="topic-del" onclick="event.stopPropagation();deleteNote(${n.id})" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>`;
    }).join('');

    document.getElementById('topicsModal').style.display = 'flex';
}
function closeTopicsModal() {
    document.getElementById('topicsModal').style.display = 'none';
}
document.getElementById('topicsModal').addEventListener('click', function(e) {
    if (e.target === this) closeTopicsModal();
});

async function openNote(id) {
    // Update lastAccessed on server
    await Notes.update(id, { lastAccessed: new Date().toISOString() });
    location.href = `note-editor.html?id=${id}`;
}

async function deleteNote(id) {
    if (!confirm('Delete this note? This cannot be undone.')) return;
    noteCache = noteCache.filter(n => n.id !== id);
    closeTopicsModal();
    renderNotes();
    await Notes.delete(id);
}

function addTopicToSubject() {
    openNewNoteModal(_openSubject);
}

document.getElementById('newTopic').addEventListener('keydown', e => {
    if (e.key === 'Enter') createNote();
});

// INIT 
loadNotes();
window.addEventListener('focus', loadNotes);

// LOGOUT 
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