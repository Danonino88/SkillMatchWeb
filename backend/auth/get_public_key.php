<?php
// Entrega la clave pública RSA al cliente
// El cliente usará esta clave para cifrar la clave AES generada localmente
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/rsa_keys.php';

$publicKey = getPublicKeyPEM();

echo json_encode(['public_key' => $publicKey]);