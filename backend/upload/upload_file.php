<?php
// Subida de archivos con hash SHA-256 registrado en BD
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$idUsuario  = (int)($_POST['id_usuario']     ?? 0);
$tipo       = $_POST['tipo']                 ?? 'manual';
$nombreProy = trim($_POST['nombre_proyecto'] ?? 'Sin título');
$descProy   = trim($_POST['desc_proyecto']   ?? '');

if (!$idUsuario) {
    http_response_code(400);
    echo json_encode(['error' => 'id_usuario es requerido.']);
    exit;
}

if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió ningún archivo o hubo un error al subir.']);
    exit;
}

$file     = $_FILES['archivo'];
$tmpPath  = $file['tmp_name'];
$origName = basename($file['name']);
$ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

$allowed = ['pdf', 'png', 'jpg', 'jpeg', 'docx', 'xlsx'];
if (!in_array($ext, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Extensión no permitida.']);
    exit;
}

// Calcular hash SHA-256 del archivo antes de moverlo
$sha256 = hash_file('sha256', $tmpPath);

$uploadDir = __DIR__ . '/../../uploads/evidencias/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$newName      = $sha256 . '.' . $ext;
$destPath     = $uploadDir . $newName;
$rutaRelativa = 'uploads/evidencias/' . $newName;

if (!move_uploaded_file($tmpPath, $destPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar el archivo.']);
    exit;
}

try {
    $pdo = getDB();

    $idEstudiante = (int)$idUsuario;
    $stmt = $pdo->prepare(
        'INSERT INTO Proyectos (id_estudiante, titulo, descripcion, estado)
         VALUES (?, ?, ?, "activo")'
    );
    $stmt->execute([$idEstudiante, $nombreProy ?: 'Sin título', $descProy ?: '']);
    $idProyecto = (int)$pdo->lastInsertId();

    // Guardar ruta y hash SHA-256 en la tabla Evidencias
    $tipoConHash = $tipo . '|sha256:' . $sha256;
    $stmt2 = $pdo->prepare(
        'INSERT INTO Evidencias (id_proyecto, ruta_archivo, tipo) VALUES (?, ?, ?)'
    );
    $stmt2->execute([$idProyecto, $rutaRelativa, $tipoConHash]);

    echo json_encode([
        'message'     => 'Archivo subido y registrado correctamente.',
        'archivo'     => $rutaRelativa,
        'sha256'      => $sha256,
        'nombre_orig' => $origName,
        'id_proyecto' => $idProyecto,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en BD: ' . $e->getMessage()]);
}