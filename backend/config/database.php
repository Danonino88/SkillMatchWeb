<?php
// ========================================
// Conexión a Base de Datos MySQL
// ========================================

// Cargar archivo .env
function loadEnv() {
    $envFile = dirname(__DIR__, 2) . '/.env';
    
    if (!file_exists($envFile)) {
        throw new Exception('Archivo .env no encontrado en: ' . $envFile);
    }

    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        // Ignorar comentarios
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parsear línea: KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Establecer como variable de entorno
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

// Cargar variables de entorno
loadEnv();

function getDB() {
    $host = getenv('DB_HOST') ?: 'localhost';
    $db   = getenv('DB_NAME') ?: 'SkillMatch';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASSWORD') ?: ''; 

    $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    
    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        throw new Exception('Error de conexión a BD: ' . $e->getMessage());
    }
}

// Para compatibilidad, crear la conexión una sola vez
try {
    $db = getDB();
} catch (Exception $e) {
    // No fallar aquí, dejar que los endpoints manejen el error
}
?>