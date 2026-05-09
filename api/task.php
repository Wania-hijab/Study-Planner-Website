<?php
require_once 'C:\xampp\htdocs\PHP\WAD Project Backend\config.php';

$userId = requireAuth();   // stops here with 401 if not logged in
$method = $_SERVER['REQUEST_METHOD'];

// ── GET — fetch all tasks for this user ───────────────────────
if ($method === 'GET') {
    $stmt = $conn->prepare(
        'SELECT id, title, subject, due_date, status, completed_at, created_at
         FROM tasks
         WHERE user_id = ?
         ORDER BY created_at DESC'
    );
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $tasks  = [];

    while ($row = $result->fetch_assoc()) {
        $tasks[] = [
            'id'           => (int) $row['id'],
            'title'        => $row['title'],
            'subject'      => $row['subject'],
            'date'         => $row['due_date'],          // keep key "date" to match frontend
            'status'       => $row['status'],
            'completedAt'  => $row['completed_at'],      // keep camelCase to match frontend
            'createdAt'    => $row['created_at']
        ];
    }
    $stmt->close();
    respond(['success' => true, 'tasks' => $tasks]);
}

// ── POST — create a new task ──────────────────────────────────
if ($method === 'POST') {
    $body    = getBody();
    $title   = trim($body['title']   ?? '');
    $subject = trim($body['subject'] ?? '');
    $date    = trim($body['date']    ?? '');     // expects YYYY-MM-DD

    if (!$title || !$subject || !$date) {
        respond(['success' => false, 'error' => 'title, subject and date are required'], 400);
    }

    $stmt = $conn->prepare(
        'INSERT INTO tasks (user_id, title, subject, due_date) VALUES (?, ?, ?, ?)'
    );
    $stmt->bind_param('isss', $userId, $title, $subject, $date);
    if (!$stmt->execute()) {
        respond(['success' => false, 'error' => 'Could not create task'], 500);
    }
    $newId = $stmt->insert_id;
    $stmt->close();

    respond([
        'success' => true,
        'task'    => [
            'id'      => $newId,
            'title'   => $title,
            'subject' => $subject,
            'date'    => $date,
            'status'  => 'pending'
        ]
    ], 201);
}

// ── PUT — update a task (complete / un-complete / edit) ───────
if ($method === 'PUT') {
    $taskId = (int) ($_GET['id'] ?? 0);
    if (!$taskId) respond(['success' => false, 'error' => 'id required'], 400);

    // Make sure this task belongs to the logged-in user
    $stmt = $conn->prepare('SELECT id, status FROM tasks WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ii', $taskId, $userId);
    $stmt->execute();
    $task = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$task) respond(['success' => false, 'error' => 'Task not found'], 404);

    $body   = getBody();
    $fields = [];   // will build SET clause dynamically
    $types  = '';
    $vals   = [];

    // Toggle or set status
    if (isset($body['status'])) {
        $newStatus   = $body['status'];   // 'pending' or 'completed'
        $completedAt = ($newStatus === 'completed') ? date('Y-m-d H:i:s') : null;
        $fields[] = 'status = ?';
        $fields[] = 'completed_at = ?';
        $types   .= 'ss';
        $vals[]   = $newStatus;
        $vals[]   = $completedAt;
    }

    // Optional: edit title / subject / due_date
    if (isset($body['title']))   { $fields[] = 'title = ?';   $types .= 's'; $vals[] = trim($body['title']); }
    if (isset($body['subject'])) { $fields[] = 'subject = ?'; $types .= 's'; $vals[] = trim($body['subject']); }
    if (isset($body['date']))    { $fields[] = 'due_date = ?';$types .= 's'; $vals[] = trim($body['date']); }

    if (empty($fields)) respond(['success' => false, 'error' => 'Nothing to update'], 400);

    $sql  = 'UPDATE tasks SET ' . implode(', ', $fields) . ' WHERE id = ? AND user_id = ?';
    $types .= 'ii';
    $vals[] = $taskId;
    $vals[] = $userId;

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$vals);
    $stmt->execute();
    $stmt->close();

    respond(['success' => true]);
}

// ── DELETE — remove a task ────────────────────────────────────
if ($method === 'DELETE') {
    $taskId = (int) ($_GET['id'] ?? 0);
    if (!$taskId) respond(['success' => false, 'error' => 'id required'], 400);

    $stmt = $conn->prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ii', $taskId, $userId);
    $stmt->execute();
    $stmt->close();

    respond(['success' => true]);
}

respond(['success' => false, 'error' => 'Method not allowed'], 405);
?>