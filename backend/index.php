<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';

$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path   = preg_replace('#^/SkillMatchWeb/backend#', '', $path);
$path   = trim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Rutas de autenticación
if ($path === 'auth/register' && $method === 'POST') {
    require_once __DIR__ . '/auth/register.php';
}
elseif ($path === 'auth/login' && $method === 'POST') {
    require_once __DIR__ . '/auth/login.php';
}
elseif ($path === 'auth/public-key' && $method === 'GET') {
    require_once __DIR__ . '/auth/get_public_key.php';
}

// Rutas de subida 
elseif ($path === 'upload/file' && $method === 'POST') {
    require_once __DIR__ . '/upload/upload_file.php';
}

// Carreras
elseif ($path === 'api/carreras' && $method === 'GET') {
    try {
        $pdo = getDB();
        $carreras = $pdo->query('SELECT nombre FROM Carreras ORDER BY nombre')->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode(['carreras' => $carreras]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Health check 
elseif ($path === 'api/health' && $method === 'GET') {
    echo json_encode([
        'status'    => 'ok',
        'message'   => 'Servidor API activo',
        'timestamp' => date('Y-m-d H:i:s'),
    ]);
}

// prueba DB
elseif ($path === 'api/db-test' && $method === 'GET') {
    try {
        $db = getDB();
        $db->query('SELECT 1');
        echo json_encode([
            'status'   => 'ok',
            'message'  => 'Conexión a BD exitosa',
            'database' => 'SkillMatch',
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// Error 404
else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Ruta no encontrada',
        'path'    => $path,
    ]);
}