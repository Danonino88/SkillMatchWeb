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
    // Soporte para req.usuario o req.user según tu middleware de JWT
    const usuario = req.usuario || req.user; 

    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Sesión no válida' });
    }

    // Buscamos el ID del usuario con fallback para asegurar que no sea undefined
    const id_actual = usuario.id_usuario || usuario.id;

    if (!id_actual) {
      console.log("❌ Error: No se encontró ID en el token:", usuario);
      return res.status(400).json({ ok: false, mensaje: 'ID de usuario no encontrado en la sesión' });
    }

    const [autenticadores] = await db.query(
      'SELECT id_credencial FROM autenticadores_biometricos WHERE id_usuario = ?', 
      [id_actual]
    );

    const options = await generateRegistrationOptions({
      rpName: 'SkillMatch UTEQ',
      rpID: RP_ID,
      // 🟢 CORRECCIÓN: Forzamos a String y luego Buffer para evitar el error de "undefined"
      userID: Buffer.from(String(id_actual)), 
      userName: usuario.correo,
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
    const id_actual = usuario.id_usuario || usuario.id;

    if (!body || !body.id) {
      return res.status(400).json({ ok: false, mensaje: 'Datos de registro incompletos o vacíos' });
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: body.challenge, 
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { registrationInfo } = verification;
      
      // Convertimos los datos binarios a formatos compatibles con MySQL (Base64URL y Buffer)
      const credentialID = Buffer.from(registrationInfo.credentialID).toString('base64url');
      const credentialPublicKey = Buffer.from(registrationInfo.credentialPublicKey);
      const counter = registrationInfo.counter;

      await db.query(
        'INSERT INTO autenticadores_biometricos (id_credencial, id_usuario, llave_publica, contador) VALUES (?, ?, ?, ?)',
        [credentialID, id_actual, credentialPublicKey, counter]
      );
      return res.json({ ok: true, mensaje: 'Face ID activado correctamente' });
    }
    
    res.status(400).json({ ok: false, mensaje: 'La verificación biométrica en el servidor falló' });
  } catch (error) {
    console.error("❌ Error verificando biometría:", error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// --- 2. LOGIN BIOMÉTRICO (INICIO DE SESIÓN DESDE EL LOGIN.JSX) ---

exports.opcionesLoginBiometrico = async (req, res) => {
  try {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ ok: false, mensaje: 'El correo electrónico es obligatorio' });

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

    if (rows.length === 0) return res.status(400).json({ ok: false, mensaje: 'Credencial no reconocida o no vinculada a este correo' });

    const user = rows[0];

    const verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: authResponse.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: Buffer.from(user.id_credencial, 'base64url'),
        credentialPublicKey: user.llave_publica,
        counter: user.contador,
      },
    });

    if (verification.verified) {
      // Actualizar contador para seguridad
      await db.query('UPDATE autenticadores_biometricos SET contador = ? WHERE id_credencial = ?', 
        [verification.authenticationInfo.newCounter, user.id_credencial]);

      // Generar Token JWT idéntico al login normal
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

    res.status(400).json({ ok: false, mensaje: 'Error al verificar la identidad biométrica' });
  } catch (error) {
    console.error("❌ Error en verificación login:", error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// ==========================================
// LOGICA DE AUTENTICACIÓN CONVENCIONAL
// ==========================================

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
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
      nombre,
      apellido,
      correo,
      password,
      id_rol,
      matricula,
      carrera,
      semestre,
      razon_social,
      giro,
      contacto
    } = req.body;

    // 🔍 LOGS DE REGISTRO INTEGRALES
    console.log('================ REGISTER =================');
    console.log('BODY:', req.body);
    console.log('id_rol:', id_rol);
    console.log('matricula:', matricula);
    console.log('carrera:', carrera);
    console.log('semestre:', semestre);

    if (!nombre || !apellido || !correo || !password || !id_rol) {
      console.log('❌ Faltan campos obligatorios');
      return res.status(400).json({
        ok: false,
        mensaje: 'Todos los campos obligatorios deben enviarse'
      });
    }

    const usuarioExistente = await Usuario.findByCorreo(correo);

    if (usuarioExistente) {
      console.log('❌ Usuario ya existe');
      return res.status(409).json({
        ok: false,
        mensaje: 'El correo ya está registrado'
      });
    }

    await conn.beginTransaction();
    console.log('🔄 Transacción iniciada');

    const password_hash = await bcrypt.hash(password, 10);

    const id_usuario = await Usuario.create({
      nombre,
      apellido,
      correo,
      password_hash,
      id_rol,
      conn
    });

    console.log('✅ Usuario insertado con id:', id_usuario);

    // 🔥 BLOQUE ESTUDIANTE (ROL 2)
    if (Number(id_rol) === 2) {
      console.log('🎓 Entró al bloque de estudiante');

      if (!matricula || !carrera || !semestre) {
        console.log('❌ Faltan datos de estudiante');
        await conn.rollback();
        console.log('⛔ ROLLBACK ejecutado');

        return res.status(400).json({
          ok: false,
          mensaje: 'Para estudiantes debes enviar matrícula, carrera y semestre'
        });
      }

      try {
        const id_estudiante = await Estudiante.create({
          id_usuario,
          matricula,
          carrera,
          semestre,
          conn
        });

        console.log('✅ Estudiante insertado con id:', id_estudiante);
      } catch (err) {
        console.log('❌ ERROR al insertar estudiante:', err.message);
        await conn.rollback();
        console.log('⛔ ROLLBACK por error en estudiante');

        return res.status(500).json({
          ok: false,
          mensaje: 'Error al insertar estudiante',
          error: err.message
        });
      }
    } 
    // 🏢 BLOQUE EMPRESA (ROL 3)
    else if (Number(id_rol) === 3) {
      console.log('🏢 Entró al bloque de empresa');

      if (!razon_social || !contacto) {
        console.log('❌ Faltan datos de empresa');
        await conn.rollback();
        console.log('⛔ ROLLBACK ejecutado');

        return res.status(400).json({
          ok: false,
          mensaje: 'Para empresas debes enviar razón social y contacto principal'
        });
      }

      try {
        const id_empresa = await Empresa.create({
          id_usuario,
          razon_social,
          giro: giro || null,
          contacto,
          conn
        });

        console.log('✅ Empresa insertada con id:', id_empresa);
      } catch (err) {
        console.log('❌ ERROR al insertar empresa:', err.message);
        await conn.rollback();
        console.log('⛔ ROLLBACK por error en empresa');

        return res.status(500).json({
          ok: false,
          mensaje: 'Error al insertar empresa',
          error: err.message
        });
      }
    } else {
      console.log('⚠️ No es estudiante ni empresa, no entra a bloques específicos');
    }

    await conn.commit();
    console.log('💾 COMMIT realizado satisfactoriamente');

    const nuevoUsuario = await Usuario.findById(id_usuario);

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado correctamente',
      usuario: nuevoUsuario
    });

  } catch (error) {
    if (conn) await conn.rollback();
    console.error('💥 ERROR GENERAL EN REGISTRO:', error);

    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor en el registro',
      error: error.message
    });
  } finally {
    if (conn) conn.release();
    console.log('🔌 Conexión a la DB liberada');
    console.log('==========================================');
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Correo y contraseña son obligatorios'
      });
    }

    const usuario = await Usuario.findByCorreo(correo);

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales incorrectas'
      });
    }

    if (usuario.estado !== 'activo') {
      return res.status(403).json({
        ok: false,
        mensaje: 'Tu cuenta de usuario está inactiva. Contacta al administrador.'
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales incorrectas'
      });
    }

    const token = generarToken(usuario);

    return res.status(200).json({
      ok: true,
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        id_rol: usuario.id_rol,
        estado: usuario.estado
      }
    });
  } catch (error) {
    console.error('Error en el login convencional:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor durante el inicio de sesión'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    return res.status(200).json({
      ok: true,
      mensaje: 'Logout exitoso. El cliente debe eliminar el token localmente.'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor al cerrar sesión'
    });
  }
};