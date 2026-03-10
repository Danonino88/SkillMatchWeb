<?php
putenv('OPENSSL_CONF=C:/xampp/apache/conf/openssl.cnf');

$config = [
    'config'           => 'C:/xampp/apache/conf/openssl.cnf',
    'digest_alg'       => 'sha256',
    'private_key_bits' => 2048,
    'private_key_type' => OPENSSL_KEYTYPE_RSA,
];

$res = openssl_pkey_new($config);

if (!$res) {
    echo "Error: " . openssl_error_string();
    exit;
}

openssl_pkey_export($res, $priv, null, $config);
$pub = openssl_pkey_get_details($res)['key'];

file_put_contents(__DIR__ . '/rsa_private.pem', $priv);
file_put_contents(__DIR__ . '/rsa_public.pem', $pub);

echo "Claves generadas OK";