// PUNTO B - Escenario 1: Cifrado híbrido RSA + AES-256-CBC con IV independiente por sesión
// Usa la Web Crypto API nativa del navegador (sin librerías externas)

const API_BASE = 'http://localhost/SkillMatchWeb/backend';

// Obtiene la clave pública RSA del servidor
async function fetchPublicKey() {
    const res = await fetch(`${API_BASE}/auth/get_public_key.php`);
    const { public_key } = await res.json();
    return public_key;
}

// Importa la clave pública PEM como CryptoKey para usar con SubtleCrypto
async function importRSAPublicKey(pem) {
    const b64 = pem
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\s/g, '');

    const binaryDer = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

    return crypto.subtle.importKey(
        'spki',
        binaryDer.buffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
    );
}

// Genera una clave AES-256 aleatoria
async function generateAESKey() {
    return crypto.subtle.generateKey(
        { name: 'AES-CBC', length: 256 },
        true,   // exportable para poder cifrarla con RSA
        ['encrypt', 'decrypt']
    );
}

// Genera un IV aleatorio de 16 bytes (único por sesión, nunca reutilizado)
function generateIV() {
    return crypto.getRandomValues(new Uint8Array(16));
}

// Exporta la CryptoKey AES como bytes crudos
async function exportAESKey(aesKey) {
    const raw = await crypto.subtle.exportKey('raw', aesKey);
    return new Uint8Array(raw);
}

// Cifra los bytes de la clave AES con la clave pública RSA
async function encryptAESKeyWithRSA(rsaPublicKey, aesKeyBytes) {
    const encrypted = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        rsaPublicKey,
        aesKeyBytes
    );
    return new Uint8Array(encrypted);
}

// Cifra el payload (objeto JS) con AES-256-CBC
async function encryptPayloadWithAES(aesKey, iv, payload) {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv },
        aesKey,
        data
    );
    return new Uint8Array(encrypted);
}

function toBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
}

// Función principal: cifra las credenciales antes de enviarlas al servidor
// El IV se genera de forma aleatoria por cada llamada (IV independiente por sesión)
export async function encryptCredentials(correo, password) {
    const pemPublicKey = await fetchPublicKey();
    const rsaPublicKey = await importRSAPublicKey(pemPublicKey);

    const aesKey     = await generateAESKey();
    const iv         = generateIV();                          // IV único, no se reutiliza
    const aesKeyBytes = await exportAESKey(aesKey);

    const encryptedKey  = await encryptAESKeyWithRSA(rsaPublicKey, aesKeyBytes);
    const encryptedData = await encryptPayloadWithAES(aesKey, iv, { correo, password });

    return {
        encrypted_key:  toBase64(encryptedKey),
        iv:             toBase64(iv),
        encrypted_data: toBase64(encryptedData),
    };
}