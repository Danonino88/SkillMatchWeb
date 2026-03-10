<?php
putenv('OPENSSL_CONF=C:/xampp/apache/conf/openssl.cnf');

define('RSA_PRIVATE_KEY_PATH', __DIR__ . '/rsa_private.pem');
define('RSA_PUBLIC_KEY_PATH',  __DIR__ . '/rsa_public.pem');

function generateRSAKeys(): void {
    $config = [
        'config'           => 'C:/xampp/apache/conf/openssl.cnf',
        'digest_alg'       => 'sha256',
        'private_key_bits' => 2048,
        'private_key_type' => OPENSSL_KEYTYPE_RSA,
    ];
    $res = openssl_pkey_new($config);
    openssl_pkey_export($res, $privateKey, null, $config);
    $publicKeyDetails = openssl_pkey_get_details($res);
    file_put_contents(RSA_PRIVATE_KEY_PATH, $privateKey);
    file_put_contents(RSA_PUBLIC_KEY_PATH,  $publicKeyDetails['key']);
}

function getPublicKeyPEM(): string {
    if (!file_exists(RSA_PUBLIC_KEY_PATH)) generateRSAKeys();
    return file_get_contents(RSA_PUBLIC_KEY_PATH);
}

function getPrivateKeyPEM(): string {
    if (!file_exists(RSA_PRIVATE_KEY_PATH)) generateRSAKeys();
    return file_get_contents(RSA_PRIVATE_KEY_PATH);
}