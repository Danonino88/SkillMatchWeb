<?php
// Registro seguro con password_hash + BCRYPT, cost=10
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$body = json_decode(file_get_contents('php://input'), true);

$nombre   = trim($body['nombre']   ?? '');
$apellido = trim($body['apellido'] ?? '');
$correo   = trim($body['correo']   ?? '');
$password = $body['password']      ?? '';
$id_rol   = (int)($body['id_rol'] ?? 2); 

if (!$nombre || !$apellido || !$correo || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Todos los campos son obligatorios.']);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Correo inválido.']);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'La contraseña debe tener al menos 8 caracteres.']);
    exit;
}

// Hashing con Bcrypt, cost=10 
// password_hash usa PASSWORD_BCRYPT que aplica el algoritmo bcrypt
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

try {
    $pdo = getDB();

    $stmt = $pdo->prepare('SELECT id_usuario FROM Usuarios WHERE correo = ?');
    $stmt->execute([$correo]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'El correo ya está registrado.']);
        exit;
    }

    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        'INSERT INTO Usuarios (nombre, apellido, correo, password_hash, id_rol) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([$nombre, $apellido, $correo, $hash, $id_rol]);
    $idUsuario = $pdo->lastInsertId();

    // Insertar en tabla específica según el rol
    if ($id_rol === 2) {
        // ESTUDIANTE
        $matricula = $body['matricula'] ?? 'MAT' . str_pad($idUsuario, 6, '0', STR_PAD_LEFT);
        $carrera   = $body['carrera']   ?? '';
        $semestre  = (int)($body['semestre'] ?? 1);

        $stmt = $pdo->prepare(
            'INSERT INTO Estudiantes (id_estudiante, matricula, carrera, semestre) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$idUsuario, $matricula, $carrera, $semestre]);

    } elseif ($id_rol === 3) {
        // EMPRESA
        $razon_social = trim($body['razon_social'] ?? '');
        $giro         = trim($body['giro']         ?? '');
        $contacto     = trim($body['contacto']     ?? '');

        $stmt = $pdo->prepare(
            'INSERT INTO Empresas (id_empresa, razon_social, giro, contacto, estado) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$idUsuario, $razon_social, $giro, $contacto, 'pendiente']);

    } elseif ($id_rol === 4) {
        // PROFESOR
        $departamento = trim($body['departamento'] ?? '');
        $asignaturas  = trim($body['asignaturas']  ?? '');

        $stmt = $pdo->prepare(
            'INSERT INTO Profesores (id_profesor, departamento, asignaturas) VALUES (?, ?, ?)'
        );
        $stmt->execute([$idUsuario, $departamento, $asignaturas]);

    } elseif ($id_rol === 5) {
        // VINCULACIÓN
        $departamento = trim($body['departamento'] ?? '');
        $cargo        = trim($body['cargo']        ?? '');

        $stmt = $pdo->prepare(
            'INSERT INTO Vinculacion (id_vinculacion, departamento, cargo) VALUES (?, ?, ?)'
        );
        $stmt->execute([$idUsuario, $departamento, $cargo]);
    }

    $pdo->commit();

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $pdo->prepare('INSERT INTO Auditoria (id_usuario, accion, ip_origen) VALUES (?, ?, ?)')
        ->execute([$idUsuario, 'REGISTRO', $ip]);

    echo json_encode(['message' => 'Usuario registrado correctamente.', 'id' => $idUsuario]);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Error en base de datos: ' . $e->getMessage()]);
}