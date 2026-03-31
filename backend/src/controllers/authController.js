const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const Usuario = require('../models/Usuario');
const Estudiante = require('../models/Estudiante');
const Empresa = require('../models/Empresa'); 

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
        mensaje: 'ID no encontrado. Por favor, cierra sesión e ingresa de nuevo.' 
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
      
      // 🟢 CORRECCIÓN DEFINITIVA BASADA EN TUS LOGS:
      // Los datos vienen dentro de registrationInfo.credential
      const credentialData = registrationInfo.credential;

      if (!credentialData || !credentialData.id || !credentialData.publicKey) {
          console.error("❌ Estructura de credential no encontrada:", registrationInfo);
          return res.status(400).json({ ok: false, mensaje: 'La información del dispositivo no es compatible.' });
      }

      // Convertimos los datos binarios a formatos compatibles con MySQL
      // registrationInfo.credential.id ya suele ser String, pero aseguramos con Buffer
      const credentialID = credentialData.id; 
      const credentialPublicKey = Buffer.from(credentialData.publicKey);
      const counter = credentialData.counter || 0;

      await db.query(
        'INSERT INTO autenticadores_biometricos (id_credencial, id_usuario, llave_publica, contador) VALUES (?, ?, ?, ?)',
        [credentialID, id_actual, credentialPublicKey, counter]
      );
      
      console.log("✅ Face ID guardado exitosamente en la base de datos.");
      return res.json({ ok: true, mensaje: 'Face ID activado correctamente' });
    }
    
    res.status(400).json({ ok: false, mensaje: 'La verificación biométrica falló' });
  } catch (error) {
    console.error("❌ Error verificando biometría:", error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// --- 2. LOGIN BIOMÉTRICO ---

exports.opcionesLoginBiometrico = async (req, res) => {
  try {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ ok: false, mensaje: 'El correo es obligatorio' });

    const [userRows] = await db.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
    if (userRows.length === 0) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });

    const [autenticadores] = await db.query(
      'SELECT id_credencial FROM autenticadores_biometricos WHERE id_usuario = ?', 
      [userRows[0].id_usuario]
    );

    if (autenticadores.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'No tienes Face ID activado en este dispositivo' });
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: autenticadores.map(auth => ({
        id: auth.id_credencial,
        type: 'public-key',
      })),
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
    const { correo, authResponse } = req.body;
    
    const [rows] = await db.query(
      `SELECT u.*, a.id_credencial, a.llave_publica, a.contador 
       FROM usuarios u 
       INNER JOIN autenticadores_biometricos a ON u.id_usuario = a.id_usuario 
       WHERE u.correo = ? AND a.id_credencial = ?`,
      [correo, authResponse.id]
    );

    if (rows.length === 0) return res.status(400).json({ ok: false, mensaje: 'Credencial no reconocida' });

    const user = rows[0];

    const verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: authResponse.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: user.id_credencial,
        credentialPublicKey: user.llave_publica,
        counter: user.contador,
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
    { id_usuario: id, correo: usuario.correo, id_rol: usuario.id_rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

exports.register = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { nombre, apellido, correo, password, id_rol, matricula, carrera, semestre, razon_social, giro, contacto } = req.body;
    if (!nombre || !apellido || !correo || !password || !id_rol) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan campos obligatorios' });
    }
    const usuarioExistente = await Usuario.findByCorreo(correo);
    if (usuarioExistente) return res.status(409).json({ ok: false, mensaje: 'El correo ya está registrado' });

    await conn.beginTransaction();
    const password_hash = await bcrypt.hash(password, 10);
    const id_usuario = await Usuario.create({ nombre, apellido, correo, password_hash, id_rol, conn });

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
    await conn.commit();
    const nuevoUsuario = await Usuario.findById(id_usuario);
    return res.status(201).json({ ok: true, mensaje: 'Usuario registrado', usuario: nuevoUsuario });
  } catch (error) {
    if (conn) await conn.rollback();
    return res.status(500).json({ ok: false, mensaje: 'Error interno', error: error.message });
  } finally {
    if (conn) conn.release();
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    const usuario = await Usuario.findByCorreo(correo);
    if (!usuario) return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    if (usuario.estado !== 'activo') return res.status(403).json({ ok: false, mensaje: 'Usuario inactivo' });
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    const token = generarToken(usuario);
    return res.status(200).json({
      ok: true,
      token,
      usuario: { id_usuario: usuario.id_usuario || usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, correo: usuario.correo, id_rol: usuario.id_rol, estado: usuario.estado }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error interno' });
  }
};

exports.logout = async (req, res) => {
  return res.status(200).json({ ok: true, mensaje: 'Logout exitoso.' });
};