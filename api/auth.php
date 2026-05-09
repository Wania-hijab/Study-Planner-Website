<?php
// ═══════════════════════════════════════════════════════════
//  auth.php  —  Signup / Login / Logout / Session check
//  URL examples your JS will call:
//    POST  api/auth.php?action=signup
//    POST  api/auth.php?action=login
//    POST  api/auth.php?action=logout
//    GET   api/auth.php?action=me
// ═══════════════════════════════════════════════════════════

require_once 'C:\xampp\htdocs\PHP\WAD Project Backend\config.php';

$action = $_GET['action'] ?? '';

switch ($action) {

    // ── SIGNUP ────────────────────────────────────────────────
    case 'signup': {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            respond(['success' => false, 'error' => 'POST required'], 405);
        }

        $body = getBody();
        $fullname = trim($body['fullname'] ?? '');
        $username = trim($body['username'] ?? '');
        $email    = trim($body['email']    ?? '');
        $password =       $body['password'] ?? '';

        // Basic validation
        if (!$fullname || !$username || !$email || !$password) {
            respond(['success' => false, 'error' => 'All fields are required'], 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(['success' => false, 'error' => 'Invalid email address'], 400);
        }
        if (strlen($password) < 6) {
            respond(['success' => false, 'error' => 'Password must be at least 6 characters'], 400);
        }

        // Check username uniqueness
        $stmt = $conn->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->bind_param('s', $username);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            respond(['success' => false, 'error' => 'Username already taken'], 409);
        }
        $stmt->close();

        // Check email uniqueness
        $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            respond(['success' => false, 'error' => 'Email already registered'], 409);
        }
        $stmt->close();

        // Hash password with bcrypt
        $hash = password_hash($password, PASSWORD_BCRYPT);

        // Insert new user
        $stmt = $conn->prepare(
            'INSERT INTO users (fullname, username, email, password) VALUES (?, ?, ?, ?)'
        );
        $stmt->bind_param('ssss', $fullname, $username, $email, $hash);
        if (!$stmt->execute()) {
            respond(['success' => false, 'error' => 'Could not create account'], 500);
        }
        $userId = $stmt->insert_id;
        $stmt->close();

        // Auto-login: start session
        $_SESSION['user_id']  = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['fullname'] = $fullname;

        respond([
            'success'  => true,
            'user'     => ['id' => $userId, 'username' => $username, 'fullname' => $fullname]
        ]);
    }

    // ── LOGIN ─────────────────────────────────────────────────
    case 'login': {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            respond(['success' => false, 'error' => 'POST required'], 405);
        }

        $body     = getBody();
        $username = trim($body['username'] ?? '');
        $password =       $body['password'] ?? '';

        if (!$username || !$password) {
            respond(['success' => false, 'error' => 'Username and password required'], 400);
        }

        // Fetch user by username
        $stmt = $conn->prepare(
            'SELECT id, fullname, username, email, password, avatar, dark_mode FROM users WHERE username = ?'
        );
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row || !password_verify($password, $row['password'])) {
            respond(['success' => false, 'error' => 'Incorrect username or password'], 401);
        }

        // Start session
        $_SESSION['user_id']  = $row['id'];
        $_SESSION['username'] = $row['username'];
        $_SESSION['fullname'] = $row['fullname'];

        respond([
            'success' => true,
            'user'    => [
                'id'        => $row['id'],
                'username'  => $row['username'],
                'fullname'  => $row['fullname'],
                'email'     => $row['email'],
                'avatar'    => $row['avatar'],
                'dark_mode' => (bool) $row['dark_mode']
            ]
        ]);
    }

    // ── LOGOUT ───────────────────────────────────────────────
    case 'logout': {
        // 1. Wipe all session variables
        $_SESSION = [];

        // 2. Delete the session cookie from the browser
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(), '', time() - 42000,
                $params['path'], $params['domain'],
                $params['secure'], $params['httponly']
            );
        }

        // 3. Destroy the session on the server
        session_destroy();

        respond(['success' => true]);
    }

    // ── ME (check session / get current user) ─────────────────
    case 'me': {
        if (empty($_SESSION['user_id'])) {
            respond(['success' => false, 'error' => 'Not logged in'], 401);
        }
        $userId = (int) $_SESSION['user_id'];

        $stmt = $conn->prepare(
            'SELECT id, fullname, username, email, avatar, bio, dark_mode FROM users WHERE id = ?'
        );
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row) {
            respond(['success' => false, 'error' => 'User not found'], 404);
        }

        respond([
            'success' => true,
            'user'    => [
                'id'        => $row['id'],
                'username'  => $row['username'],
                'fullname'  => $row['fullname'],
                'email'     => $row['email'],
                'avatar'    => $row['avatar'],
                'bio'       => $row['bio'],
                'dark_mode' => (bool) $row['dark_mode']
            ]
        ]);
    }

    default:
        respond(['success' => false, 'error' => 'Unknown action'], 400);
}
?>