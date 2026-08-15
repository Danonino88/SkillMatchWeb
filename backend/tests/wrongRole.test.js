const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

describe('DE - Control de acceso por rol', () => {
  test('debe rechazar a un usuario autenticado sin permisos administrativos', async () => {
    const token = jwt.sign(
      {
        id_usuario: 999999,
        correo: 'test.estudiante@uteq.edu.mx',
        id_rol: 2
      },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    const response = await request(app)
      .get('/api/admin/chatbot')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe(
      'Solo el administrador puede acceder a este módulo.'
    );
  });
});