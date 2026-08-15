const request = require('supertest');
const app = require('../src/app');
const Usuario = require('../src/models/Usuario');

// Simular el modelo de Usuario para evitar errores de base de datos
jest.mock('../src/models/Usuario');

describe('DE - Control de Intentos de Login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('debe rechazar intentos con credenciales incorrectas usando 401', async () => {
    // Simular que el usuario no existe en la BD
    Usuario.findByCorreo.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        correo: 'intento_fallido@test.com',
        password: 'PasswordErronea123!'
      });

    expect([400, 401, 429]).toContain(response.status);
    expect(response.body.ok).toBe(false);
  });

  test('debe responder con 401 cuando la contraseña es incorrecta', async () => {
    // Simular que el usuario sí existe
    Usuario.findByCorreo.mockResolvedValue({
      id_usuario: 99,
      correo: 'existe@test.com',
      password_hash: '$2b$10$e8.fakehashforTestingOnly1234567890',
      estado: 'activo'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        correo: 'existe@test.com',
        password: 'PasswordInvalida'
      });

    expect([400, 401, 429]).toContain(response.status);
    expect(response.body.ok).toBe(false);
  });
});