<?php
// PUNTO B - Escenario 1: Descifrado híbrido RSA + AES-256-CBC con IV independiente por sesión
// PUNTO A: Verificación con password_verify (compatible con bcrypt)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/rsa_keys.php';

$body = json_decode(file_get_contents('php://input'), true);

// El cliente envía:
//   encrypted_key: clave AES cifrada con RSA público (base64)
//   iv:            IV aleatorio usado para AES (base64) - único por sesión
//   encrypted_data: {correo, password} cifrado con AES (base64)

$encryptedKey  = base64_decode($body['encrypted_key']  ?? '');
$iv            = base64_decode($body['iv']             ?? '');
$encryptedData = base64_decode($body['encrypted_data'] ?? '');

if (!$encryptedKey || !$iv || !$encryptedData) {
    http_response_code(400);
    echo json_encode(['error' => 'Payload cifrado incompleto.']);
    exit;
}

// Paso 1: Descifrar la clave AES usando la clave privada RSA
$privateKeyPEM = getPrivateKeyPEM();
$privateKey    = openssl_pkey_get_private($privateKeyPEM);

$aesKey = '';
$ok = openssl_private_decrypt($encryptedKey, $aesKey, $privateKey, OPENSSL_PKCS1_OAEP_PADDING);

if (!$ok || strlen($aesKey) !== 32) {
    http_response_code(400);
    echo json_encode(['error' => 'No se pudo descifrar la clave AES.']);
    exit;
}

// Paso 2: Descifrar el payload con AES-256-CBC usando la clave y el IV recibidos
// El IV viaja junto al mensaje pero es único por sesión (nunca reutilizado)
$decrypted = openssl_decrypt($encryptedData, 'AES-256-CBC', $aesKey, OPENSSL_RAW_DATA, $iv);

if ($decrypted === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Fallo al descifrar el payload AES.']);
    exit;
}

$credentials = json_decode($decrypted, true);
$correo   = trim($credentials['correo']   ?? '');
$password = $credentials['password'] ?? '';

if (!$correo || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Credenciales vacías tras descifrado.']);
    exit;
}

try {
    $pdo = getDB();

    $stmt = $pdo->prepare(
        'SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.contraseña, u.estado, r.nombre_rol
         FROM Usuarios u
         JOIN Roles r ON u.id_rol = r.id_rol
         WHERE u.correo = ?'
    );
    $stmt->execute([$correo]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas.']);
        exit;
    }

    if ($user['estado'] !== 'activo') {
        http_response_code(403);
        echo json_encode(['error' => 'Cuenta inactiva.']);
        exit;
    }

    // PUNTO A: password_verify compara contra el hash bcrypt almacenado
    if (!password_verify($password, $user['contraseña'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas.']);
        exit;
    }

    // Auditoría de acceso exitoso
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $pdo->prepare('INSERT INTO Auditoria (id_usuario, accion, ip_origen) VALUES (?, ?, ?)')
        ->execute([$user['id_usuario'], 'LOGIN', $ip]);

    unset($user['contraseña']);

    echo json_encode([
        'message' => 'Login exitoso.',
        'user'    => $user,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en base de datos: ' . $e->getMessage()]);
}