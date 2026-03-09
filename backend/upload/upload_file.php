<?php
// PUNTO C: Subida de archivos con hash SHA-256 registrado en BD
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$idProyecto = (int)($_POST['id_proyecto'] ?? 0);
$tipo       = $_POST['tipo'] ?? 'documento';

if (!$idProyecto) {
    http_response_code(400);
    echo json_encode(['error' => 'id_proyecto es requerido.']);
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

// PUNTO C: Calcular hash SHA-256 del archivo antes de moverlo
$sha256 = hash_file('sha256', $tmpPath);

$uploadDir = __DIR__ . '/../../uploads/evidencias/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Nombre único usando el hash para evitar colisiones
$newName  = $sha256 . '.' . $ext;
$destPath = $uploadDir . $newName;
$rutaRelativa = 'uploads/evidencias/' . $newName;

if (!move_uploaded_file($tmpPath, $destPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar el archivo.']);
    exit;
}

try {
    $pdo = getDB();

    // Guardar ruta y hash SHA-256 en la tabla Evidencias
    // El campo 'tipo' se reutiliza para almacenar "sha256:<hash>" para evidencia
    $stmt = $pdo->prepare(
        'INSERT INTO Evidencias (id_proyecto, ruta_archivo, tipo) VALUES (?, ?, ?)'
    );
    $tipoConHash = $tipo . '|sha256:' . $sha256;
    $stmt->execute([$idProyecto, $rutaRelativa, $tipoConHash]);

    echo json_encode([
        'message'      => 'Archivo subido y registrado correctamente.',
        'archivo'      => $rutaRelativa,
        'sha256'       => $sha256,
        'nombre_orig'  => $origName,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al registrar en BD: ' . $e->getMessage()]);
}