const request = require('supertest');
const app = require('../src/app');

describe('DE - Protección contra token JWT inválido', () => {
  test('debe rechazar una solicitud con un token inválido', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token_invalido');

    expect(response.status).toBe(401);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe('Token inválido o expirado');
  });
});