const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('DE - Prevención de Inyección y Payloads Maliciosos', () => {
  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  test('debe rechazar o sanitizar la inyección de scripts y SQL en el login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        correo: "<script>alert('xss')</script>@test.com",
        password: "' OR '1'='1"
      });

    expect([400, 401]).toContain(response.status);
    expect(response.body.ok).toBe(false);
  });
});