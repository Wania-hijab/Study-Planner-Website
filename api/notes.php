<?php
// ═══════════════════════════════════════════════════════════
//  notes.php  —  Full CRUD for notes + file attachments
//  URL examples:
//    GET    api/notes.php             → all notes for user
//    POST   api/notes.php             → create note
//    PUT    api/notes.php?id=3        → update note content / lastAccessed
//    DELETE api/notes.php?id=3        → delete note
//
//  File attachment sub-actions (passed in query string):
//    POST   api/notes.php?action=add_file&note_id=3
//    DELETE api/notes.php?action=del_file&file_id=7
// ═══════════════════════════════════════════════════════════

require_once 'C:\xampp\htdocs\PHP\WAD Project Backend\config.php';

$userId = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ── ADD FILE to a note ────────────────────────────────────────
if ($method === 'POST' && $action === 'add_file') {
    $noteId = (int) ($_GET['note_id'] ?? 0);
    if (!$noteId) respond(['success' => false, 'error' => 'note_id required'], 400);

    // Verify the note belongs to this user
    $stmt = $conn->prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ii', $noteId, $userId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) respond(['success' => false, 'error' => 'Note not found'], 404);
    $stmt->close();

    $body     = getBody();
    $fileName = trim($body['name'] ?? '');
    $fileExt  = trim($body['ext']  ?? '');
    $fileData = $body['data'] ?? '';   // base64 string

    if (!$fileName || !$fileData) respond(['success' => false, 'error' => 'name and data required'], 400);

    $stmt = $conn->prepare(
        'INSERT INTO note_files (note_id, file_name, file_ext, file_data) VALUES (?, ?, ?, ?)'
    );
    $stmt->bind_param('isss', $noteId, $fileName, $fileExt, $fileData);
    $stmt->execute();
    $fileId = $stmt->insert_id;
    $stmt->close();

    respond(['success' => true, 'file_id' => $fileId]);
}

// ── DELETE FILE from a note ───────────────────────────────────
if ($method === 'DELETE' && $action === 'del_file') {
    $fileId = (int) ($_GET['file_id'] ?? 0);
    if (!$fileId) respond(['success' => false, 'error' => 'file_id required'], 400);

    // Make sure the file belongs to a note owned by this user
    $stmt = $conn->prepare(
        'DELETE nf FROM note_files nf
         INNER JOIN notes n ON n.id = nf.note_id
         WHERE nf.id = ? AND n.user_id = ?'
    );
    $stmt->bind_param('ii', $fileId, $userId);
    $stmt->execute();
    $stmt->close();

    respond(['success' => true]);
}

// ── GET — all notes for this user (with their files) ──────────
if ($method === 'GET') {
    // Fetch all notes
    $stmt = $conn->prepare(
        'SELECT id, subject, topic, content, last_accessed, created_at
         FROM notes WHERE user_id = ? ORDER BY created_at DESC'
    );
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $notesResult = $stmt->get_result();
    $notes = [];
    $noteIds = [];

    while ($row = $notesResult->fetch_assoc()) {
        $notes[$row['id']] = [
            'id'           => (int) $row['id'],
            'subject'      => $row['subject'],
            'topic'        => $row['topic'],
            'content'      => $row['content'] ?? '',
            'lastAccessed' => $row['last_accessed'],
            'createdAt'    => $row['created_at'],
            'files'        => []
        ];
        $noteIds[] = (int) $row['id'];
    }
    $stmt->close();

    // Fetch files for all notes in one query (efficient)
    if (!empty($noteIds)) {
        $placeholders = implode(',', array_fill(0, count($noteIds), '?'));
        $types        = str_repeat('i', count($noteIds));
        $stmt = $conn->prepare(
            "SELECT id, note_id, file_name, file_ext, file_data, added_at
             FROM note_files WHERE note_id IN ($placeholders)"
        );
        $stmt->bind_param($types, ...$noteIds);
        $stmt->execute();
        $filesResult = $stmt->get_result();

        while ($file = $filesResult->fetch_assoc()) {
            $nid = (int) $file['note_id'];
            if (isset($notes[$nid])) {
                $notes[$nid]['files'][] = [
                    'id'      => (int) $file['id'],
                    'name'    => $file['file_name'],
                    'ext'     => $file['file_ext'],
                    'data'    => $file['file_data'],
                    'addedAt' => $file['added_at']
                ];
            }
        }
        $stmt->close();
    }

    respond(['success' => true, 'notes' => array_values($notes)]);
}

// ── POST — create a new note ──────────────────────────────────
if ($method === 'POST') {
    $body    = getBody();
    $subject = trim($body['subject'] ?? '');
    $topic   = trim($body['topic']   ?? '');

    if (!$subject || !$topic) {
        respond(['success' => false, 'error' => 'subject and topic required'], 400);
    }

    $now  = date('Y-m-d H:i:s');
    $stmt = $conn->prepare(
        'INSERT INTO notes (user_id, subject, topic, last_accessed, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('issss', $userId, $subject, $topic, $now, $now);
    $stmt->execute();
    $newId = $stmt->insert_id;
    $stmt->close();

    respond([
        'success' => true,
        'note'    => [
            'id'           => $newId,
            'subject'      => $subject,
            'topic'        => $topic,
            'content'      => '',
            'lastAccessed' => $now,
            'createdAt'    => $now,
            'files'        => []
        ]
    ], 201);
}

// ── PUT — update note content / topic / lastAccessed ─────────
if ($method === 'PUT') {
    $noteId = (int) ($_GET['id'] ?? 0);
    if (!$noteId) respond(['success' => false, 'error' => 'id required'], 400);

    // Verify ownership
    $stmt = $conn->prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ii', $noteId, $userId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) respond(['success' => false, 'error' => 'Note not found'], 404);
    $stmt->close();

    $body   = getBody();
    $fields = [];
    $types  = '';
    $vals   = [];

    if (isset($body['topic']))        { $fields[] = 'topic = ?';         $types .= 's'; $vals[] = trim($body['topic']); }
    if (array_key_exists('content', $body)) { $fields[] = 'content = ?'; $types .= 's'; $vals[] = $body['content']; }
    if (isset($body['lastAccessed'])) { $fields[] = 'last_accessed = ?'; $types .= 's'; $vals[] = $body['lastAccessed']; }

    // Always refresh last_accessed when saving
    if (!isset($body['lastAccessed'])) {
        $fields[] = 'last_accessed = ?';
        $types   .= 's';
        $vals[]   = date('Y-m-d H:i:s');
    }

    if (empty($fields)) respond(['success' => false, 'error' => 'Nothing to update'], 400);

    $sql   = 'UPDATE notes SET ' . implode(', ', $fields) . ' WHERE id = ? AND user_id = ?';
    $types .= 'ii';
    $vals[] = $noteId;
    $vals[] = $userId;

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$vals);
    $stmt->execute();
    $stmt->close();

    respond(['success' => true]);
}

// ── DELETE — remove a note (cascade deletes its files too) ────
if ($method === 'DELETE' && !$action) {
    $noteId = (int) ($_GET['id'] ?? 0);
    if (!$noteId) respond(['success' => false, 'error' => 'id required'], 400);

    $stmt = $conn->prepare('DELETE FROM notes WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ii', $noteId, $userId);
    $stmt->execute();
    $stmt->close();

    respond(['success' => true]);
}

respond(['success' => false, 'error' => 'Method not allowed'], 405);
?>