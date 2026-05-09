<?php
// ═══════════════════════════════════════════════════════════
//  tips.php  —  Favourite / bookmark study tips
//  URL examples:
//    GET    api/tips.php             → get all saved tip IDs
//    POST   api/tips.php             → save a tip  { tip_id: 5 }
//    DELETE api/tips.php?tip_id=5    → remove a saved tip
// ═══════════════════════════════════════════════════════════

require_once 'C:\xampp\htdocs\PHP\WAD Project Backend\config.php';

$userId = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];

// ── GET — fetch all saved tip IDs for this user ───────────────
if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT tip_id FROM fav_tips WHERE user_id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $ids    = [];
    while ($row = $result->fetch_assoc()) {
        $ids[] = (int) $row['tip_id'];
    }
    $stmt->close();
    respond(['success' => true, 'favourites' => $ids]);
}

// ── POST — save a tip ─────────────────────────────────────────
if ($method === 'POST') {
    $body  = getBody();
    $tipId = (int) ($body['tip_id'] ?? 0);
    if (!$tipId) respond(['success' => false, 'error' => 'tip_id required'], 400);

    // INSERT IGNORE silently skips if the row already exists
    $stmt = $conn->prepare('INSERT IGNORE INTO fav_tips (user_id, tip_id) VALUES (?, ?)');
    $stmt->bind_param('ii', $userId, $tipId);
    $stmt->execute();
    $stmt->close();

    respond(['success' => true]);
}

// ── DELETE — unsave a tip ─────────────────────────────────────
if ($method === 'DELETE') {
    $tipId = (int) ($_GET['tip_id'] ?? 0);
    if (!$tipId) respond(['success' => false, 'error' => 'tip_id required'], 400);

    $stmt = $conn->prepare('DELETE FROM fav_tips WHERE user_id = ? AND tip_id = ?');
    $stmt->bind_param('ii', $userId, $tipId);
    $stmt->execute();
    $stmt->close();

    respond(['success' => true]);
}

respond(['success' => false, 'error' => 'Method not allowed'], 405);
?>