<?php
// ═══════════════════════════════════════════════════════════
//  profile.php  —  Get & update user profile
//  URL examples:
//    GET  api/profile.php            → get full profile
//    PUT  api/profile.php            → update any profile fields
//    POST api/profile.php?action=delete_account → delete account
// ═══════════════════════════════════════════════════════════

require_once 'C:\xampp\htdocs\PHP\WAD Project Backend\config.php';

$userId = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ── DELETE ACCOUNT ────────────────────────────────────────────
if ($method === 'POST' && $action === 'delete_account') {
    // Cascade will delete tasks, notes, files, fav_tips automatically
    $stmt = $conn->prepare('DELETE FROM users WHERE id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $stmt->close();

    $_SESSION = [];
    session_destroy();
    respond(['success' => true]);
}

// ── GET — fetch profile ───────────────────────────────────────
if ($method === 'GET') {
    $stmt = $conn->prepare(
        'SELECT id, fullname, username, email, avatar, bio, dark_mode, created_at
         FROM users WHERE id = ?'
    );
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) respond(['success' => false, 'error' => 'User not found'], 404);

    respond([
        'success' => true,
        'profile' => [
            'id'        => (int) $row['id'],
            'fullname'  => $row['fullname'],
            'username'  => $row['username'],
            'email'     => $row['email'],
            'avatar'    => $row['avatar'],
            'bio'       => $row['bio'],
            'darkMode'  => (bool) $row['dark_mode'],
            'createdAt' => $row['created_at']
        ]
    ]);
}

// ── PUT — update profile ──────────────────────────────────────
if ($method === 'PUT') {
    $body   = getBody();
    $fields = [];
    $types  = '';
    $vals   = [];

    // Each field is optional — only update what was sent
    if (isset($body['fullname'])) {
        $fields[] = 'fullname = ?';
        $types   .= 's';
        $vals[]   = trim($body['fullname']);
    }

    if (isset($body['email'])) {
        $email = trim($body['email']);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(['success' => false, 'error' => 'Invalid email'], 400);
        }
        // Check email isn't taken by another user
        $chk = $conn->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
        $chk->bind_param('si', $email, $userId);
        $chk->execute();
        if ($chk->get_result()->num_rows > 0) {
            respond(['success' => false, 'error' => 'Email already in use'], 409);
        }
        $chk->close();
        $fields[] = 'email = ?';
        $types   .= 's';
        $vals[]   = $email;
    }

    if (isset($body['bio'])) {
        $fields[] = 'bio = ?';
        $types   .= 's';
        $vals[]   = trim($body['bio']);
    }

    if (isset($body['avatar'])) {
        $fields[] = 'avatar = ?';
        $types   .= 's';
        $vals[]   = $body['avatar'];   // base64 string
    }

    if (isset($body['darkMode'])) {
        $dm       = $body['darkMode'] ? 1 : 0;
        $fields[] = 'dark_mode = ?';
        $types   .= 'i';
        $vals[]   = $dm;
    }

    // Password change — requires current password verification
    if (!empty($body['newPassword'])) {
        if (empty($body['currentPassword'])) {
            respond(['success' => false, 'error' => 'Current password required'], 400);
        }
        if (strlen($body['newPassword']) < 6) {
            respond(['success' => false, 'error' => 'Password must be at least 6 characters'], 400);
        }

        // Fetch current hash
        $chk = $conn->prepare('SELECT password FROM users WHERE id = ?');
        $chk->bind_param('i', $userId);
        $chk->execute();
        $row = $chk->get_result()->fetch_assoc();
        $chk->close();

        if (!password_verify($body['currentPassword'], $row['password'])) {
            respond(['success' => false, 'error' => 'Current password is incorrect'], 401);
        }

        $newHash  = password_hash($body['newPassword'], PASSWORD_BCRYPT);
        $fields[] = 'password = ?';
        $types   .= 's';
        $vals[]   = $newHash;
    }

    if (empty($fields)) {
        respond(['success' => false, 'error' => 'Nothing to update'], 400);
    }

    $sql   = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $types .= 'i';
    $vals[] = $userId;

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$vals);
    if (!$stmt->execute()) {
        respond(['success' => false, 'error' => 'Update failed'], 500);
    }
    $stmt->close();

    respond(['success' => true]);
}

respond(['success' => false, 'error' => 'Method not allowed'], 405);
?>