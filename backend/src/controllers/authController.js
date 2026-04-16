const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const Usuario = require('../models/Usuario');
const Estudiante = require('../models/Estudiante');
const Empresa = require('../models/Empresa'); 
const Profesor = require('../models/Profesor');
const forge = require('node-forge');
const CryptoJS = require('crypto-js');

// ==========================================
// 🛡️ SEGURIDAD: GENERACIÓN DE LLAVES RSA (ESCENARIO 1)
// ==========================================
let rsaKeyPair = null;

// Generar el par de llaves al iniciar el servidor (Llaves de 2048 bits)
forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 }, function (err, keypair) {
  if (err) {
    console.error("❌ Error generando llaves RSA:", err);
  } else {
    rsaKeyPair = keypair;
    console.log("✅ Llaves RSA generadas correctamente para el Cifrado Híbrido");
  }
});

// Función para enviar la Llave Pública a React
exports.obtenerLlavePublica = (req, res) => {
  if (!rsaKeyPair) {
    return res.status(500).json({ ok: false, mensaje: 'Las llaves aún se están generando. Intenta en un momento.' });
  }
  const publicKeyPem = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
  res.json({ ok: true, publicKey: publicKeyPem });
};


// ==========================================
// LOGICA PARA FACE ID / WEBAUTHN
// ==========================================
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

// 🌐 CONFIGURACIÓN PARA PRODUCCIÓN (RENDER)
const RP_ID = 'skillmatch-lkz9.onrender.com'; 
const ORIGIN = `https://${RP_ID}`;

// --- 1. REGISTRO BIOMÉTRICO (ACTIVACIÓN DESDE EL PERFIL) ---

exports.opcionesRegistroBiometrico = async (req, res) => {
  try {
    const usuario = req.usuario || req.user; 

    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Sesión no válida' });
    }

    const id_actual = usuario.id_usuario || usuario.id || usuario.sub;

    if (!id_actual) {
      return res.status(400).json({ 
        ok: false, 
        mensaje: 'ID no encontrado. Por favor, cierra sesión e ingresa de nuevo para actualizar tu acceso.' 
      });
    }

    const [autenticadores] = await db.query(
      'SELECT id_credencial FROM autenticadores_biometricos WHERE id_usuario = ?', 
      [id_actual]
    );

    const options = await generateRegistrationOptions({
      rpName: 'SkillMatch UTEQ',
      rpID: RP_ID,
      userID: Buffer.from(String(id_actual)), 
      userName: usuario.correo || 'usuario@uteq.edu.mx',
      attestationType: 'none',
      excludeCredentials: autenticadores.map(auth => ({
        id: auth.id_credencial,
        type: 'public-key',
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    res.json(options);
  } catch (error) {
    console.error("❌ Error en opciones registro:", error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

exports.verificarRegistroBiometrico = async (req, res) => {
  try {
    const { body } = req;
    const usuario = req.usuario || req.user;
    const id_actual = usuario.id_usuario || usuario.id || usuario.sub;

    if (!body || !body.id) {
      return res.status(400).json({ ok: false, mensaje: 'Datos de registro incompletos' });
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: body.challenge, 
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { registrationInfo } = verification;
      const credentialData = registrationInfo.credential;

      if (!credentialData || !credentialData.id || !credentialData.publicKey) {
          return res.status(400).json({ ok: false, mensaje: 'La información del dispositivo es incompleta.' });
      }

      const credentialID = credentialData.id; 
      const credentialPublicKey = Buffer.from(credentialData.publicKey);
      const counter = credentialData.counter || 0;

      await db.query(
        'INSERT INTO autenticadores_biometricos (id_credencial, id_usuario, llave_publica, contador) VALUES (?, ?, ?, ?)',
        [credentialID, id_actual, credentialPublicKey, counter]
      );
      
      return res.json({ ok: true, mensaje: 'Face ID activado correctamente' });
    }
    
    res.status(400).json({ ok: false, mensaje: 'La verificación biométrica falló' });
  } catch (error) {
    console.error("❌ Error verificando biometría:", error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// --- 2. LOGIN BIOMÉTRICO (INICIO DE SESIÓN) ---
exports.opcionesLoginBiometrico = async (req, res) => {
  try {
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'preferred',
    });

    res.json(options);
  } catch (error) {
    console.error("❌ Error en opciones login:", error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

exports.verificarLoginBiometrico = async (req, res) => {
  try {
    const { authResponse, challenge } = req.body;
    
    const [rows] = await db.query(
      `SELECT u.*, a.id_credencial, a.llave_publica, a.contador 
       FROM usuarios u 
       INNER JOIN autenticadores_biometricos a ON u.id_usuario = a.id_usuario 
       WHERE a.id_credencial = ?`,
      [authResponse.id]
    );

    if (rows.length === 0) return res.status(400).json({ ok: false, mensaje: 'Credencial no reconocida en este dispositivo.' });

    const user = rows[0];

    const verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: user.id_credencial,
        publicKey: Buffer.from(user.llave_publica),
        counter: Number(user.contador || 0),
      },
    });

    if (verification.verified) {
      await db.query('UPDATE autenticadores_biometricos SET contador = ? WHERE id_credencial = ?', 
        [verification.authenticationInfo.newCounter, user.id_credencial]);

      const token = jwt.sign(
        { id_usuario: user.id_usuario, correo: user.correo, id_rol: user.id_rol },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.json({
        ok: true,
        token,
        usuario: {
          id_usuario: user.id_usuario,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          id_rol: user.id_rol
        }
      });
    }

    res.status(400).json({ ok: false, mensaje: 'Error al verificar biometría' });
  } catch (error) {
    console.error("❌ Error en verificación login:", error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};


// ==========================================
// LOGICA DE AUTENTICACIÓN CONVENCIONAL
// ==========================================

const generarToken = (usuario) => {
  const id = usuario.id_usuario || usuario.id;
  return jwt.sign(
    {
      id_usuario: id,
      correo: usuario.correo,
      id_rol: usuario.id_rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

exports.register = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const {
      nombre, apellido, correo, password, telefono, id_rol,
      matricula, carrera, semestre,       // Estudiante
      razon_social, giro, contacto,       // Empresa
      departamento, asignaturas           // Profesor
    } = req.body;

    if (!nombre || !apellido || !correo || !password || !id_rol) {
      return res.status(400).json({ ok: false, mensaje: 'Todos los campos obligatorios deben enviarse' });
    }

    const usuarioExistente = await Usuario.findByCorreo(correo);
    if (usuarioExistente) return res.status(409).json({ ok: false, mensaje: 'El correo ya está registrado' });

    await conn.beginTransaction();
    const password_hash = await bcrypt.hash(password, 10);

    const id_usuario = await Usuario.create({
      nombre, apellido, correo, password_hash, telefono, id_rol, conn
    });

    if (Number(id_rol) === 2) {
      if (!matricula || !carrera || !semestre) {
        await conn.rollback();
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos de estudiante' });
      }
      await Estudiante.create({ id_usuario, matricula, carrera, semestre, conn });
    } 
    else if (Number(id_rol) === 3) {
      if (!razon_social || !contacto) {
        await conn.rollback();
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos de empresa' });
      }
      await Empresa.create({ id_usuario, razon_social, giro: giro || null, contacto, conn });
    }
    else if (Number(id_rol) === 4) {
      await Profesor.create({ id_usuario, departamento, asignaturas, conn });
    }

    await conn.commit();

    const nuevoUsuario = await Usuario.findById(id_usuario);
    const token = generarToken(nuevoUsuario);

    return res.status(201).json({ 
      ok: true, 
      mensaje: 'Usuario registrado correctamente', 
      usuario: {
        id_usuario: nuevoUsuario.id_usuario,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        correo: nuevoUsuario.correo,
        id_rol: nuevoUsuario.id_rol
      },
      token 
    });

  } catch (error) {
    if (conn) await conn.rollback();
    console.error('💥 ERROR GENERAL:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor', error: error.message });
  } finally {
    if (conn) conn.release();
  }
};

// 🟢 MODIFICACIÓN: DESCIFRADO HÍBRIDO (RSA + AES) EN EL LOGIN CON LOGS PARA AUDITORÍA
exports.login = async (req, res) => {
  try {
    const { correo, password, encryptedPassword, encryptedAesKey, iv } = req.body;

    if (!correo) return res.status(400).json({ ok: false, mensaje: 'Correo obligatorio' });

    let finalPassword = password; // Por si entran de otra forma sin cifrado

    // 🟢 Si el cliente manda la versión cifrada, la desciframos y mostramos en LOGS 🟢
    if (encryptedPassword && encryptedAesKey && iv) {
      if (!rsaKeyPair) return res.status(500).json({ ok: false, mensaje: 'Las llaves RSA no están listas.' });

      console.log("\n=======================================================");
      console.log("🛡️  AUDITORÍA DE SEGURIDAD: CIFRADO HÍBRIDO (ESCENARIO 1)");
      console.log("=======================================================");
      console.log(`👤 Usuario intentando acceder: ${correo}`);
      console.log("📦 1. Paquete cifrado recibido desde el Frontend (React):");
      console.log(`   🔸 IV (Vector de Inicialización Único): ${iv}`);
      console.log(`   🔸 Llave Simétrica AES (Cifrada con RSA): ${encryptedAesKey.substring(0, 30)}... [TRUNCADO]`);
      console.log(`   🔸 Contraseña del usuario (Cifrada con AES): ${encryptedPassword}`);

      try {
        // 1. Descifrar la llave AES usando nuestra Llave Privada RSA
        const decryptedAesKey = rsaKeyPair.privateKey.decrypt(forge.util.decode64(encryptedAesKey));
        console.log("\n🔓 2. Descifrado Asimétrico (RSA) Exitoso:");
        console.log(`   ✅ Llave Privada RSA del Servidor descifró la llave AES: ${decryptedAesKey}`);
        
        // 2. Usar la llave AES descubierta y el IV para descifrar la contraseña
        const aesKeyWordArray = CryptoJS.enc.Base64.parse(decryptedAesKey);
        const ivWordArray = CryptoJS.enc.Base64.parse(iv);
        
        const decryptedData = CryptoJS.AES.decrypt(encryptedPassword, aesKeyWordArray, {
          iv: ivWordArray,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
        
        finalPassword = decryptedData.toString(CryptoJS.enc.Utf8);
        
        if (!finalPassword) throw new Error("Fallo en la decodificación AES");

        console.log("\n🔓 3. Descifrado Simétrico (AES) Exitoso:");
        console.log(`   ✅ Contraseña original descubierta: "${finalPassword}"`);
        console.log("=======================================================\n");

      } catch (err) {
        console.error("❌ Error descifrando paquete de login:", err);
        return res.status(400).json({ ok: false, mensaje: 'Error de integridad en el inicio de sesión seguro.' });
      }
    }

    if (!finalPassword) return res.status(400).json({ ok: false, mensaje: 'Contraseña requerida' });

    // 🟢 LOGICA NORMAL DESPUÉS DEL DESCIFRADO
    const usuario = await Usuario.findByCorreo(correo);

    if (!usuario || usuario.estado !== 'activo') {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas o usuario inactivo' });
    }

    // Aquí se valida usando bcrypt (El Punto A de tu rúbrica)
    const passwordValido = await bcrypt.compare(finalPassword, usuario.password_hash);

    if (!passwordValido) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    const token = generarToken(usuario);

    return res.status(200).json({
      ok: true,
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario || usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        id_rol: usuario.id_rol,
        estado: usuario.estado
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

exports.logout = async (req, res) => {
  return res.status(200).json({ ok: true, mensaje: 'Logout exitoso.' });
};