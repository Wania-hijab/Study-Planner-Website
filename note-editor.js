const params  = new URLSearchParams(location.search);
const noteId  = parseInt(params.get('id'));
let   note    = null;
let   autoSaveTimer = null;

// INIT 
async function init() {
    // Fetch all notes, find the one we need
    const res = await Notes.getAll();
    if (!res || !res.success) { alert('Could not load notes.'); location.href = 'notes.html'; return; }

    note = res.notes.find(n => n.id === noteId);
    if (!note) { alert('Note not found.'); location.href = 'notes.html'; return; }

    // Header / nav
    document.title = `${note.topic} – StudyPlanner`;
    document.getElementById('navTitle').textContent     = note.topic;
    document.getElementById('navSubject').textContent   = note.subject;
    document.getElementById('paperSubject').textContent = note.subject.toUpperCase();
    document.getElementById('paperTopic').value         = note.topic;

    // Info panel
    document.getElementById('infoSubject').textContent = note.subject;
    document.getElementById('infoCreated').textContent = note.createdAt
        ? new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';
    updateSavedLabel();

    // Content
    document.getElementById('editorBody').innerHTML = note.content || '';

    // Files
    renderFileList();
    updateWordCount();
}

// EXEC COMMAND 
function execCmd(cmd, val) {
    document.getElementById('editorBody').focus();
    document.execCommand(cmd, false, val || null);
}
function applyHeading(tag) {
    document.getElementById('editorBody').focus();
    document.execCommand('formatBlock', false, tag || 'p');
}
function handleTab(e) {
    if (e.key === 'Tab') { e.preventDefault(); execCmd('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;'); }
}

// INSERT HELPERS 
function insertLink() {
    const url  = prompt('Enter URL:'); if (!url) return;
    const text = prompt('Link text (leave blank to use URL):') || url;
    execCmd('insertHTML', `<a href="${url}" target="_blank" style="color:#4a6cf7;">${text}</a>`);
}
function insertInlineImage() {
    const input  = document.createElement('input');
    input.type   = 'file'; input.accept = 'image/*';
    input.onchange = function() {
        const file = this.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = e => execCmd('insertImage', e.target.result);
        reader.readAsDataURL(file);
    };
    input.click();
}
function insertTable() {
    const rows = parseInt(prompt('Rows:', '3')) || 3;
    const cols = parseInt(prompt('Columns:', '3')) || 3;
    let html = '<table style="border-collapse:collapse;width:100%;margin:12px 0;">';
    for (let r = 0; r < rows; r++) {
        html += '<tr>';
        for (let c = 0; c < cols; c++) {
            const tag = r === 0 ? 'th' : 'td';
            const bg  = r === 0 ? 'background:#eef2ff;font-weight:700;' : '';
            html += `<${tag} style="border:1px solid #dde3f0;padding:8px 12px;${bg}">&nbsp;</${tag}>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    execCmd('insertHTML', html);
}

// FILE UPLOAD
const ALLOWED_EXTS = ['docx','xlsx','xls','pptx','ppt','pdf','png','jpg','jpeg'];

async function handleFileUpload(fileList) {
    for (const file of Array.from(fileList)) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTS.includes(ext)) { alert(`"${file.name}" is not allowed.`); continue; }
        if (file.size > 5 * 1024 * 1024) { alert(`"${file.name}" exceeds 5MB.`); continue; }

        const reader = new FileReader();
        reader.onload = async e => {
            const res = await Notes.addFile(noteId, {
                name: file.name,
                ext:  ext,
                data: e.target.result
            });
            if (res && res.success) {
                // Add to local note object and re-render
                if (!note.files) note.files = [];
                note.files.push({ id: res.file_id, name: file.name, ext, data: e.target.result });
                renderFileList();
            }
        };
        reader.readAsDataURL(file);
    }
}

function getFileIcon(ext) {
    const map = {
        pdf:'fa-file-pdf', docx:'fa-file-word', doc:'fa-file-word',
        xlsx:'fa-file-excel', xls:'fa-file-excel',
        pptx:'fa-file-powerpoint', ppt:'fa-file-powerpoint',
        png:'fa-file-image', jpg:'fa-file-image', jpeg:'fa-file-image'
    };
    return map[ext] || 'fa-file';
}

function renderFileList() {
    const list = document.getElementById('fileList');
    if (!note || !note.files || !note.files.length) {
        list.innerHTML = '<p style="font-size:12px;color:#ccc;text-align:center;padding:8px 0;">No attachments yet</p>';
        return;
    }
    list.innerHTML = note.files.map(f => `
        <div class="file-item">
            <i class="fa-solid ${getFileIcon(f.ext)}"></i>
            <span title="${f.name}">${f.name}</span>
            <a href="${f.data}" download="${f.name}" style="color:#4a6cf7;font-size:13px;padding:2px 5px;border-radius:5px;text-decoration:none;" title="Download">
                <i class="fa-solid fa-download"></i>
            </a>
            <button class="file-del" onclick="deleteFile(${f.id})" title="Remove">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>`).join('');
}

async function deleteFile(fileId) {
    if (!confirm('Remove this attachment?')) return;
    note.files = note.files.filter(f => f.id !== fileId);
    renderFileList();
    await Notes.delFile(fileId);
}

// SAVE
async function saveNote() {
    const topic   = document.getElementById('paperTopic').value.trim() || note.topic;
    const content = document.getElementById('editorBody').innerHTML;

    await Notes.update(noteId, {
        topic,
        content,
        lastAccessed: new Date().toISOString()
    });

    note.topic   = topic;
    note.content = content;
    updateSavedLabel();
    flashSave();
}

function updateSavedLabel() {
    const d = note.lastAccessed || note.createdAt;
    document.getElementById('infoSaved').textContent = d
        ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '—';
}
function flashSave() {
    const btn = document.querySelector('.save-btn');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
    btn.style.background = 'linear-gradient(135deg,#1abc9c,#16a085)';
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
        btn.style.background = '';
    }, 1800);
}

function scheduleSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveNote, 30000);
}
function onEditorInput() { updateWordCount(); scheduleSave(); }
function updateWordCount() {
    const text  = document.getElementById('editorBody').innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.replace(/\s/g, '').length;
    document.getElementById('wordCount').textContent =
        `${words} word${words !== 1 ? 's' : ''} · ${chars} character${chars !== 1 ? 's' : ''}`;
}

document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNote(); }
});

function goBack() { saveNote().then(() => { location.href = 'notes.html'; }); }

// START
init();