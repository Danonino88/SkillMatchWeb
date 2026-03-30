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

const RP_ID = 'skillmatch-lkz9.onrender.com'; // El dominio de tu FRONTEND (sin https)
const ORIGIN = `https://${RP_ID}`;

// --- 1. REGISTRO (ACTIVACIÓN DESDE EL PERFIL) ---

exports.opcionesRegistroBiometrico = async (req, res) => {
  try {
    const usuario = req.usuario; // Obtenido del JWT
    const [autenticadores] = await db.query(
      'SELECT id_credencial FROM autenticadores_biometricos WHERE id_usuario = ?', 
      [usuario.id_usuario]
    );

    const options = await generateRegistrationOptions({
      rpName: 'SkillMatch UTEQ',
      rpID: RP_ID,
      userID: usuario.id_usuario.toString(),
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
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

exports.verificarRegistroBiometrico = async (req, res) => {
  try {
    const { body } = req;
    const usuario = req.usuario;

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: body.challenge, 
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (verification.verified) {
      const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;
      
      await db.query(
        'INSERT INTO autenticadores_biometricos (id_credencial, id_usuario, llave_publica, contador) VALUES (?, ?, ?, ?)',
        [credentialID, usuario.id_usuario, credentialPublicKey, counter]
      );
      return res.json({ ok: true, mensaje: 'Face ID activado' });
    }
    res.status(400).json({ ok: false, mensaje: 'Verificación fallida' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// --- 2. LOGIN (INICIO DE SESIÓN DESDE EL LOGIN.JSX) ---

exports.opcionesLoginBiometrico = async (req, res) => {
  try {
    const { correo } = req.body;
    const [user] = await db.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);

    if (user.length === 0) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });

    const [autenticadores] = await db.query(
      'SELECT id_credencial FROM autenticadores_biometricos WHERE id_usuario = ?', 
      [user[0].id_usuario]
    );

    if (autenticadores.length === 0) return res.status(400).json({ ok: false, mensaje: 'No tienes Face ID activado en este dispositivo' });

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: autenticadores.map(auth => ({
        id: auth.id_credencial,
        type: 'public-key',
        transports: ['internal'],
      })),
      userVerification: 'preferred',
    });

    res.json(options);
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

exports.verificarLoginBiometrico = async (req, res) => {
  try {
    const { correo, authResponse } = req.body;
    
    // Buscar al usuario y su llave pública
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
      expectedChallenge: authResponse.challenge, // El front debe mandarlo
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: user.id_credencial,
        credentialPublicKey: user.llave_publica,
        counter: user.contador,
      },
    });

    if (verification.verified) {
      // Actualizar contador para evitar ataques de replay
      await db.query('UPDATE autenticadores_biometricos SET contador = ? WHERE id_credencial = ?', 
        [verification.authenticationInfo.newCounter, user.id_credencial]);

      // Generar el mismo Token que en el login normal
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

    res.status(400).json({ ok: false, mensaje: 'Error al verificar cara/huella' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};


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

    // 🔍 LOGS IMPORTANTES
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

    // 🔥 BLOQUE ESTUDIANTE
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
      console.log('⚠️ No es estudiante ni empresa, no entra al bloque');
    }

    await conn.commit();
    console.log('💾 COMMIT realizado');

    const nuevoUsuario = await Usuario.findById(id_usuario);

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado correctamente',
      usuario: nuevoUsuario
    });

  } catch (error) {
    await conn.rollback();
    console.error('💥 ERROR GENERAL:', error);

    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  } finally {
    conn.release();
    console.log('🔌 Conexión liberada');
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
        mensaje: 'Usuario inactivo'
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
    console.error('Error en login:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    return res.status(200).json({
      ok: true,
      mensaje: 'Logout exitoso. El cliente debe eliminar el token.'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }



  
};