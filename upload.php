<?php
/**
 * Endpoint para recibir snapshots JSON desde el script local `elecciones26.py`.
 *
 * Colocar este archivo en la carpeta pública de snapshots del dashboard:
 *   /home/padillaprado/htdocs/padillaprado.me/elecciones2026/snapshots/upload.php
 *
 * Cada archivo llega por multipart POST con header `X-Upload-Token`.
 * Solo acepta nombres `snapshot_<YYYYMMDD>_<HHMMSS>.json` o `index.json`.
 * El archivo se guarda en la misma carpeta donde está este script.
 */
declare(strict_types=1);

// ===== CONFIG =====
// Token debe coincidir con UPLOAD_TOKEN en elecciones26.py.
const UPLOAD_TOKEN = 'FUJIMORINUNCAMAS';

header('Content-Type: application/json; charset=utf-8');

function fail(int $code, string $msg): void {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'Method not allowed');
}

$token = $_SERVER['HTTP_X_UPLOAD_TOKEN'] ?? '';
if (!hash_equals(UPLOAD_TOKEN, (string) $token)) {
    fail(401, 'Unauthorized');
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    fail(400, 'Missing or invalid file upload');
}

$name = basename((string) $_FILES['file']['name']);
if (!preg_match('/^(snapshot_\d{8}_\d{6}\.json|index\.json)$/', $name)) {
    fail(400, 'Invalid filename: ' . $name);
}

$content = file_get_contents($_FILES['file']['tmp_name']);
if ($content === false) {
    fail(500, 'Cannot read upload');
}
json_decode($content);
if (json_last_error() !== JSON_ERROR_NONE) {
    fail(400, 'Invalid JSON payload');
}

// Escritura atómica: .tmp + rename. Evita que el dashboard lea un JSON
// truncado si descarga justo mientras escribimos.
$dest = __DIR__ . '/' . $name;
$tmp  = $dest . '.tmp';
if (file_put_contents($tmp, $content) === false) {
    fail(500, 'Cannot write temp file');
}
if (!rename($tmp, $dest)) {
    @unlink($tmp);
    fail(500, 'Cannot commit file');
}

echo json_encode(['ok' => true, 'file' => $name, 'bytes' => strlen($content)]);
