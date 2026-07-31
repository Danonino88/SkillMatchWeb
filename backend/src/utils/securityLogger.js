function sanitizeDetails(details = {}) {
  const blockedFields = [
    'password',
    'contrasena',
    'token',
    'authorization',
    'encryptedPassword',
    'encryptedAesKey',
    'decryptedAesKey',
    'iv',
  ];

  return Object.fromEntries(
    Object.entries(details).filter(
      ([key]) => !blockedFields.includes(key)
    )
  );
}

function securityLog(event, req, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level: 'security',
    event,
    method: req?.method || null,
    path: req?.originalUrl || req?.url || null,
    ip: req?.ip || req?.socket?.remoteAddress || null,
    userAgent: req?.get?.('user-agent') || null,
    details: sanitizeDetails(details),
  };

  console.warn(JSON.stringify(entry));
}

module.exports = {
  securityLog,
};
