<?php
// API Principal - SkillMatch

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar OPTIONS request para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Cargar configuración
require_once __DIR__ . '/config/database.php';

// Obtener y limpiar la ruta
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/backend', '', $path); // Remover /backend si existe
$path = trim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Debug: mostrar la ruta procesada
// error_log("Path: $path | Method: $method");

// Rutas disponibles
if ($path === 'api/health' && $method === 'GET') {
    http_response_code(200);
    echo json_encode([
        'status' => 'ok',
        'message' => 'Servidor API activo',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
elseif ($path === 'api/db-test' && $method === 'GET') {
    try {
        $db = getDB();
        $result = $db->query('SELECT 1');
        http_response_code(200);
        echo json_encode([
            'status' => 'ok',
            'message' => 'Conexión a BD exitosa',
            'database' => getenv('DB_NAME'),
            'host' => getenv('DB_HOST')
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error de conexión a BD',
            'error' => $e->getMessage()
        ]);
    }
}
elseif ($path === 'api/usuarios' && $method === 'GET') {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Lista de usuarios',
        'data' => []
    ]);
}
elseif (preg_match('/^api\/usuarios\/(\d+)$/', $path, $matches) && $method === 'GET') {
    $id = $matches[1];
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Usuario obtenido',
        'data' => ['id' => $id]
    ]);
}
elseif ($path === 'api/usuarios' && $method === 'POST') {
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Usuario creado',
        'data' => []
    ]);
}
else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Ruta no encontrada',
        'path' => $path,
        'method' => $method,
        'available_routes' => [
            'GET /api/health',
            'GET /api/usuarios',
            'GET /api/usuarios/{id}',
            'POST /api/usuarios'
        ]
    ]);
}
?>
