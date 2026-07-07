const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Estudiante = require('../models/Estudiante');
const Empresa = require('../models/Empresa'); 
const Profesor = require('../models/Profesor');
const forge = require('node-forge');
const CryptoJS = require('crypto-js');
const db = require('../config/db');


// ==========================================
// SEGURIDAD: GENERACIÓN DE LLAVES RSA (ESCENARIO 1)
// ==========================================
let rsaKeyPair = null;

// Generar el par de llaves al iniciar el servidor (Llaves de 2048 bits)
forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 }, function (err, keypair) {
  if (err) {
    console.error("❌ Error generando llaves RSA:", err);
  } else {
    rsaKeyPair = keypair;
    console.log(" Llaves RSA generadas correctamente para el Cifrado Híbrido");
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

// CONFIGURACIÓN DE WEBAUTHN (LOCAL / PRODUCCIÓN POR VARIABLES DE ENTORNO)
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

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


// LOGIN CON LOGS DE AUDITORÍA AVANZADA (PARA DEMOSTRACIÓN)
exports.login = async (req, res) => {
  try {
    const { correo, password, encryptedPassword, encryptedAesKey, iv } = req.body;

    if (!correo) return res.status(400).json({ ok: false, mensaje: 'Correo obligatorio' });

    let finalPassword = password; 

    // ‍ INICIO DE AUDITORÍA EN LOGS
    if (encryptedPassword && encryptedAesKey && iv) {
      console.log("\n" + "=".repeat(60));
      console.log("🛡️  SISTEMA DE CIFRADO HÍBRIDO - INICIO DE SESIÓN SEGURO");
      console.log("=".repeat(60));
      console.log(`📡 ORIGEN: Petición recibida desde el Cliente (Frontend)`);
      console.log(`👤 USUARIO: ${correo}`);
      console.log("-".repeat(60));

      try {
        // --- FASE 1: DESEMPAQUETADO ---
        console.log("📦 [FASE 1: RECEPCIÓN DE PAQUETE HÍBRIDO]");
        console.log(`   ► IV (Vector aleatorio por sesión): ${iv}`);
        console.log(`   ► AES Key (Cifrada con RSA Pública): ${encryptedAesKey.substring(0, 40)}...`);
        console.log(`   ► Payload (Contraseña cifrada): ${encryptedPassword}`);

        // --- FASE 2: DES-INTERCAMBIO DE LLAVES (RSA) ---
        console.log("\n🔑 [FASE 2: DESCIFRADO ASIMÉTRICO RSA]");
        console.log("   ► Acción: Usando Llave Privada del Servidor para recuperar clave AES...");
        
        const decryptedAesKey = rsaKeyPair.privateKey.decrypt(forge.util.decode64(encryptedAesKey));
        
        console.log("   ✅ ÉXITO: Clave de sesión AES recuperada.");
        console.log(`   🔓 Clave AES Simétrica descubierta: ${decryptedAesKey}`);

        // --- FASE 3: DESCIFRADO DE DATOS (AES) ---
        console.log("\n🔓 [FASE 3: DESCIFRADO SIMÉTRICO AES-256-CBC]");
        const aesKeyWordArray = CryptoJS.enc.Base64.parse(decryptedAesKey);
        const ivWordArray = CryptoJS.enc.Base64.parse(iv);
        
        const decryptedData = CryptoJS.AES.decrypt(encryptedPassword, aesKeyWordArray, {
          iv: ivWordArray,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
        
        finalPassword = decryptedData.toString(CryptoJS.enc.Utf8);
        
        if (!finalPassword) throw new Error("Fallo en integridad AES");

        console.log(`   ✅ ÉXITO: Contraseña descifrada correctamente.`);
        console.log(`   🔐 Contraseña original: ${"*".repeat(finalPassword.length)} (${finalPassword})`);
        
        // --- FASE 4: HASHING CHECK (BCRYPT) ---
        console.log("\n🔎 [FASE 4: VERIFICACIÓN DE INTEGRIDAD BCRYPT]");
        console.log("   ► Acción: Comparando texto plano con Hash almacenado en DB...");
        
      } catch (err) {
        console.log("❌ ERROR CRÍTICO EN DESCIFRADO HÍBRIDO:");
        console.error(err);
        return res.status(400).json({ ok: false, mensaje: 'Error de integridad en el inicio de sesión seguro.' });
      }
    }

    // CONTINUACIÓN NORMAL DEL LOGIN
    const usuario = await Usuario.findByCorreo(correo);

    if (!usuario || usuario.estado !== 'activo') {
      console.log("   ❌ RESULTADO: Usuario no encontrado o inactivo.");
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas o usuario inactivo' });
    }

    const passwordValido = await bcrypt.compare(finalPassword, usuario.password_hash);

    if (!passwordValido) {
      console.log("   ❌ RESULTADO: Contraseña incorrecta (Bcrypt no coincide).");
      console.log("=".repeat(60) + "\n");
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    console.log("   ✅ RESULTADO: Autenticación exitosa. Generando JWT...");
    console.log("=".repeat(60) + "\n");

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

