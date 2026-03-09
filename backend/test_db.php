<?php
require_once __DIR__ . '/config/database.php';

try {
    $pdo = getDB();

    $tablas = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $totalTablas = count($tablas);

    // Contar registros en Roles y Usuarios
    $totalRoles    = $pdo->query("SELECT COUNT(*) FROM Roles")->fetchColumn();
    $totalUsuarios = $pdo->query("SELECT COUNT(*) FROM Usuarios")->fetchColumn();

    $roles = $pdo->query("SELECT * FROM Roles")->fetchAll();

?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Test BD — SkillMatch</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f6fa; color: #1a2340; margin: 0; padding: 40px; }
    .card { background: white; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .badge-ok  { display: inline-block; background: #d1fae5; color: #065f46; font-weight: 700; padding: 6px 14px; border-radius: 20px; font-size: 14px; margin-bottom: 24px; }
    .badge-err { display: inline-block; background: #fee2e2; color: #991b1b; font-weight: 700; padding: 6px 14px; border-radius: 20px; font-size: 14px; margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #71706F; margin: 20px 0 8px; }
    .stats { display: flex; gap: 12px; margin-bottom: 8px; }
    .stat { flex: 1; background: #f4f6fa; border-radius: 8px; padding: 14px; text-align: center; }
    .stat-num  { font-size: 28px; font-weight: 800; color: #232E56; }
    .stat-label { font-size: 12px; color: #71706F; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 8px 12px; background: #f4f6fa; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #71706F; }
    td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; }
    tr:last-child td { border-bottom: none; }
    .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; margin-right: 6px; }
    .warning { background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🗄 Test de Conexión — SkillMatch</h1>
    <div class="badge-ok">✅ Conexión exitosa</div>

    <div class="section-title">Resumen</div>
    <div class="stats">
      <div class="stat">
        <div class="stat-num"><?= $totalTablas ?></div>
        <div class="stat-label">Tablas</div>
      </div>
      <div class="stat">
        <div class="stat-num"><?= $totalRoles ?></div>
        <div class="stat-label">Roles</div>
      </div>
      <div class="stat">
        <div class="stat-num"><?= $totalUsuarios ?></div>
        <div class="stat-label">Usuarios</div>
      </div>
    </div>

    <div class="section-title">Tablas encontradas</div>
    <table>
      <tr><th>Tabla</th></tr>
      <?php foreach ($tablas as $t): ?>
        <tr><td><span class="dot"></span><?= htmlspecialchars($t) ?></td></tr>
      <?php endforeach; ?>
    </table>

    <?php if ($totalRoles > 0): ?>
    <div class="section-title">Roles registrados</div>
    <table>
      <tr><th>ID</th><th>Nombre</th></tr>
      <?php foreach ($roles as $r): ?>
        <tr>
          <td><?= $r['id_rol'] ?></td>
          <td><?= htmlspecialchars($r['nombre_rol']) ?></td>
        </tr>
      <?php endforeach; ?>
    </table>
    <?php endif; ?>

    <div class="warning">
      ⚠️ <strong>Recuerda:</strong> elimina este archivo antes de subir a producción.
    </div>
  </div>
</body>
</html>

<?php

} catch (PDOException $e) {

?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Test BD — Error</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f6fa; margin: 0; padding: 40px; }
    .card { background: white; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .badge-err { display: inline-block; background: #fee2e2; color: #991b1b; font-weight: 700; padding: 6px 14px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; }
    .error-box { background: #fff5f5; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 16px; font-size: 13px; color: #7f1d1d; font-family: monospace; word-break: break-all; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #71706F; margin: 20px 0 8px; }
    ul { font-size: 13px; line-height: 2; padding-left: 18px; color: #444; }
    code { background: #f4f6fa; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🗄 Test de Conexión — SkillMatch</h1>
    <div class="badge-err">❌ Error de conexión</div>

    <div class="section-title">Mensaje de error</div>
    <div class="error-box"><?= htmlspecialchars($e->getMessage()) ?></div>

    <div class="section-title">Posibles causas</div>
    <ul>
      <li>MySQL no está corriendo en XAMPP</li>
      <li>Contraseña incorrecta en <code>database.php</code></li>
      <li>La base de datos <code>SkillMatch</code> no existe — ejecuta el <code>schema.sql</code></li>
      <li>El usuario <code>root</code> no tiene permisos</li>
    </ul>
  </div>
</body>
</html>
<?php } ?>